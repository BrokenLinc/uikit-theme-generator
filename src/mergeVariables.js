import { clone, each } from "lodash";

const mergeVariables = (defaultVariables = [], userVariables = []) => {
  const variables = {};
  each(defaultVariables, (variable) => {
    variables[variable.name] = clone(variable);
  });
  each(userVariables, (variable) => {
    // console.log(variable);
    variables[variable.name] = {
      ...variables[variable.name],
      ...variable,
      isCustom: !variables[variable.name],
    };
  });
  return variables;
};

export default mergeVariables;