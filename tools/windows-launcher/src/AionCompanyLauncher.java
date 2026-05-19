import java.awt.Desktop;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class AionCompanyLauncher {
    private static final String DASHBOARD_URL = "http://localhost:5173";
    private static final String BACKEND_HEALTH_URL = "http://localhost:8080/actuator/health";

    public static void main(String[] args) throws Exception {
        Path projectRoot = findProjectRoot();
        Path logsDir = projectRoot.resolve("logs");
        Files.createDirectories(logsDir);

        println("AION Company Launcher");
        println("Projeto: " + projectRoot);
        println("Logs: " + logsDir);

        runDocker(projectRoot, logsDir);
        waitForPostgres(logsDir);
        startBackendIfNeeded(projectRoot, logsDir);
        startFrontendIfNeeded(projectRoot, logsDir);

        waitForHttp(BACKEND_HEALTH_URL, 45_000);
        waitForHttp(DASHBOARD_URL, 45_000);
        openBrowser(DASHBOARD_URL);

        println("AION Control Tower aberto em " + DASHBOARD_URL);
        println("Pode fechar esta janela. Backend e frontend continuam rodando em segundo plano.");
    }

    private static Path findProjectRoot() {
        List<Path> candidates = new ArrayList<>();
        String envHome = System.getenv("AION_TASKMASTER_HOME");
        if (envHome != null && !envHome.isBlank()) {
            candidates.add(Paths.get(envHome));
        }

        Path current = Paths.get(System.getProperty("user.dir")).toAbsolutePath();
        candidates.add(current);

        try {
            Path appPath = Paths.get(AionCompanyLauncher.class.getProtectionDomain().getCodeSource().getLocation().toURI()).toAbsolutePath();
            candidates.add(Files.isDirectory(appPath) ? appPath : appPath.getParent());
        } catch (Exception ignored) {
            // The fixed project-root candidates below still allow the launcher to work.
        }

        Path walker = current;
        for (int i = 0; i < 6 && walker != null; i++) {
            candidates.add(walker);
            walker = walker.getParent();
        }

        candidates.add(Paths.get("C:/AI-Company/projects/taskmaster"));

        for (Path candidate : candidates) {
            Path normalized = candidate.normalize();
            if (isProjectRoot(normalized)) {
                return normalized;
            }
        }

        throw new IllegalStateException("Nao encontrei o projeto TaskMaster. Defina AION_TASKMASTER_HOME=C:\\AI-Company\\projects\\taskmaster e tente novamente.");
    }

    private static boolean isProjectRoot(Path path) {
        return Files.exists(path.resolve("backend/pom.xml"))
            && Files.exists(path.resolve("frontend/package.json"))
            && Files.exists(path.resolve("infra/docker-compose.yml"));
    }

    private static void runDocker(Path projectRoot, Path logsDir) throws IOException, InterruptedException {
        println("Subindo PostgreSQL via Docker Compose...");
        int exitCode = runAndWait(
            logsDir.resolve("docker.log"),
            projectRoot.resolve("infra"),
            "docker", "compose", "-f", projectRoot.resolve("infra/docker-compose.yml").toString(), "up", "-d"
        );
        if (exitCode != 0) {
            throw new IllegalStateException("Docker Compose falhou. Veja logs/docker.log");
        }
    }

    private static void waitForPostgres(Path logsDir) throws IOException, InterruptedException {
        println("Aguardando PostgreSQL ficar pronto...");
        long deadline = System.currentTimeMillis() + 60_000;
        while (System.currentTimeMillis() < deadline) {
            int exitCode = runAndWait(
                logsDir.resolve("postgres-ready.log"),
                null,
                "docker", "exec", "taskmaster-postgres", "pg_isready", "-U", "taskmaster_app", "-d", "taskmaster"
            );
            if (exitCode == 0) {
                println("PostgreSQL pronto.");
                return;
            }
            Thread.sleep(2_000);
        }
        throw new IllegalStateException("PostgreSQL nao ficou pronto em 60s. Veja logs/postgres-ready.log");
    }

    private static void startBackendIfNeeded(Path projectRoot, Path logsDir) throws IOException {
        if (isHttpReady(BACKEND_HEALTH_URL, 1_500)) {
            println("Backend ja esta online.");
            return;
        }

        Path jar = projectRoot.resolve("backend/target/taskmaster-backend-0.0.1-SNAPSHOT.jar");
        if (!Files.exists(jar)) {
            throw new IllegalStateException("Jar do backend nao encontrado: " + jar + ". Rode mvn package em backend antes de abrir o launcher.");
        }

        println("Iniciando backend Spring Boot...");
        startProcess(
            logsDir.resolve("backend.log"),
            projectRoot.resolve("backend"),
            javaExecutable(), "-jar", jar.toString()
        );
    }

    private static void startFrontendIfNeeded(Path projectRoot, Path logsDir) throws IOException {
        if (isHttpReady(DASHBOARD_URL, 1_500)) {
            println("Frontend ja esta online.");
            return;
        }

        println("Iniciando frontend Vite...");
        startProcess(
            logsDir.resolve("frontend.log"),
            projectRoot.resolve("frontend"),
            npmExecutable(), "run", "dev", "--", "--host", "127.0.0.1"
        );
    }

    private static String javaExecutable() {
        String javaHome = System.getProperty("java.home");
        String executable = isWindows() ? "java.exe" : "java";
        return Paths.get(javaHome, "bin", executable).toString();
    }

    private static String npmExecutable() {
        return isWindows() ? "npm.cmd" : "npm";
    }

    private static boolean isWindows() {
        return System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win");
    }

    private static void startProcess(Path logFile, Path workingDirectory, String... command) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(command);
        if (workingDirectory != null) {
            builder.directory(workingDirectory.toFile());
        }
        builder.redirectErrorStream(true);
        builder.redirectOutput(ProcessBuilder.Redirect.appendTo(logFile.toFile()));
        builder.start();
        println("Processo iniciado: " + String.join(" ", command));
    }

    private static int runAndWait(Path logFile, Path workingDirectory, String... command) throws IOException, InterruptedException {
        ProcessBuilder builder = new ProcessBuilder(command);
        if (workingDirectory != null) {
            builder.directory(workingDirectory.toFile());
        }
        builder.redirectErrorStream(true);
        builder.redirectOutput(ProcessBuilder.Redirect.appendTo(logFile.toFile()));
        return builder.start().waitFor();
    }

    private static void waitForHttp(String url, long timeoutMs) throws InterruptedException {
        println("Aguardando " + url + "...");
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            if (isHttpReady(url, 1_500)) {
                println("OK: " + url);
                return;
            }
            Thread.sleep(1_500);
        }
        throw new IllegalStateException("Servico nao respondeu: " + url);
    }

    private static boolean isHttpReady(String url, int timeoutMs) {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setConnectTimeout(timeoutMs);
            connection.setReadTimeout(timeoutMs);
            connection.setRequestMethod("GET");
            int status = connection.getResponseCode();
            return status >= 200 && status < 500;
        } catch (Exception ignored) {
            return false;
        }
    }

    private static void openBrowser(String url) throws Exception {
        if (Desktop.isDesktopSupported()) {
            Desktop.getDesktop().browse(URI.create(url));
            return;
        }
        if (isWindows()) {
            new ProcessBuilder("cmd", "/c", "start", "", url).start();
            return;
        }
        println("Abra manualmente: " + url);
    }

    private static void println(String message) {
        System.out.println("[" + LocalDateTime.now() + "] " + message);
    }
}
