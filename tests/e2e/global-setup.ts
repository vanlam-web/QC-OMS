async function globalSetup() {
  const required = ["E2E_ADMIN_EMAIL", "E2E_ADMIN_PASSWORD"];
  const missing = required.filter((name) => process.env[name] === undefined);

  if (missing.length > 0) {
    throw new Error(`Missing required E2E environment variables: ${missing.join(", ")}`);
  }
}

export default globalSetup;
