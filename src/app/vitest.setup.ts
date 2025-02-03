// vitest.setup.ts
globalThis.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  } as unknown as Storage;
  