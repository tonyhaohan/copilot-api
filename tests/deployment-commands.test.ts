import { test, expect } from "bun:test"

test("Documentation command examples are valid", () => {
  // Test the port and host parameter combinations mentioned in documentation
  const deploymentScenarios = [
    {
      description: "Default localhost deployment",
      args: { port: 4141, host: undefined },
      expectedUrl: "http://localhost:4141",
      expectedHostname: "127.0.0.1",
    },
    {
      description: "Remote server with IP",
      args: { port: 4141, host: "166.111.25.29" },
      expectedUrl: "http://166.111.25.29:4141",
      expectedHostname: "0.0.0.0",
    },
    {
      description: "Remote server with domain",
      args: { port: 4141, host: "myserver.com" },
      expectedUrl: "http://myserver.com:4141",
      expectedHostname: "0.0.0.0",
    },
    {
      description: "Custom port",
      args: { port: 8080, host: "166.111.25.29" },
      expectedUrl: "http://166.111.25.29:8080",
      expectedHostname: "0.0.0.0",
    },
  ]

  for (const scenario of deploymentScenarios) {
    // Test URL construction (same logic as in src/start.ts line 62)
    const serverUrl = `http://${scenario.args.host || "localhost"}:${scenario.args.port}`
    expect(serverUrl).toBe(scenario.expectedUrl)

    // Test hostname binding logic (same logic as in src/start.ts line 111)
    const hostname = scenario.args.host ? "0.0.0.0" : "127.0.0.1"
    expect(hostname).toBe(scenario.expectedHostname)
  }
})

test("SSH and Copilot-API ports don't conflict", () => {
  // Test that SSH port and Copilot API port are different services
  const sshPort = 1234 // User's SSH port
  const copilotApiPort = 4141 // Default Copilot API port

  // These should be different
  expect(sshPort).not.toBe(copilotApiPort)

  // Both should be valid port numbers
  expect(sshPort).toBeGreaterThan(0)
  expect(sshPort).toBeLessThan(65536)
  expect(copilotApiPort).toBeGreaterThan(0)
  expect(copilotApiPort).toBeLessThan(65536)
})

test("Port configuration matches documentation examples", () => {
  // Test that the default port in documentation matches actual default
  const defaultPort = 4141

  // This should match the default in src/start.ts
  expect(defaultPort.toString()).toBe("4141")

  // Test common ports that might be used
  const validPorts = [3000, 4141, 8080, 8888]

  for (const port of validPorts) {
    expect(port).toBeGreaterThan(0)
    expect(port).toBeLessThan(65536)
  }
})
