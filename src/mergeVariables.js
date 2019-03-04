import { clone, each } from "lodash";

const mergeVariables = (defaultVariables = [], userVariables = []) => {
  const variables = {};
  each(defaultVariables, (variable) => {
    variables[variable.name] = clone(variable);
  });
  each(userVariables, (variable) => {
    const defaultVariable = variables[variable.name];
    const isCustom = !defaultVariable;
    const isChanged = isCustom || (defaultVariable.value != variable.value);
    // console.log(isChanged);
    // console.log(variable);
    variables[variable.name] = {
      ...defaultVariable,
      ...variable,
      isCustom,
      isChanged,
    };
  });
  return variables;
};

export default mergeVariables;