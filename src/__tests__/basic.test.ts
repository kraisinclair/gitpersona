import { PersonaManager } from "../utils/persona";
import { ConfigManager } from "../utils/config";

describe("GitPersona Basic Tests", () => {
  let configManager: ConfigManager;
  let personaManager: PersonaManager;

  beforeEach(() => {
    // Create fresh instances for each test
    configManager = new ConfigManager();
    personaManager = new PersonaManager();
  });

  test("ConfigManager should initialize with empty config", () => {
    const config = configManager.getConfig();
    expect(config.personas).toHaveLength(0);
    expect(config.sshKeys).toHaveLength(0);
    expect(config.version).toBe("1.0.0");
  });

  test("PersonaManager should have no personas initially", () => {
    const personas = personaManager.getAllPersonas();
    expect(personas).toHaveLength(0);
  });

  test("PersonaManager should have no active persona initially", () => {
    const activePersona = personaManager.getActivePersona();
    expect(activePersona).toBeUndefined();
  });

  test("PersonaManager status should show correct counts", () => {
    const status = personaManager.getPersonaStatus();
    expect(status.total).toBe(0);
    expect(status.active).toBeUndefined();
    expect(status.autoActivationPaths).toHaveLength(0);
  });
});
