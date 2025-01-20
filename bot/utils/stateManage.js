import fs from "fs";

const stateFile = "state.json";

export const loadState = () => {
  if (fs.existsSync(stateFile)) {
    const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    return state;
  }
  return { hasInitialized: {} };
};

export const saveState = (state) => {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
};
