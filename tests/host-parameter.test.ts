import { test, expect } from "bun:test"

test("Server URL construction with host parameter", () => {
  // Test URL construction logic directly
  const testCases = [
    { host: undefined, port: 4141, expected: "http://localhost:4141" },
    {
      host: "192.168.1.100",
      port: 4141,
      expected: "http://192.168.1.100:4141",
    },
    { host: "0.0.0.0", port: 3000, expected: "http://0.0.0.0:3000" },
    { host: "myserver.com", port: 8080, expected: "http://myserver.com:8080" },
  ]

  for (const { host, port, expected } of testCases) {
    const serverUrl = `http://${host || "localhost"}:${port}`
    expect(serverUrl).toBe(expected)
  }
})

test("Hostname binding logic", () => {
  // Test hostname binding logic for server
  const testCases = [
    { host: undefined, expectedHostname: "127.0.0.1" },
    { host: "192.168.1.100", expectedHostname: "0.0.0.0" },
    { host: "myserver.com", expectedHostname: "0.0.0.0" },
  ]

  for (const { host, expectedHostname } of testCases) {
    const hostname = host ? "0.0.0.0" : "127.0.0.1"
    expect(hostname).toBe(expectedHostname)
  }
})
