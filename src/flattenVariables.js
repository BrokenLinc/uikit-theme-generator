import { each } from "lodash";

const flattenVariables = (variables) => {
  const result = {};
  each(variables, ({ name, value }) => {
    result[name] = value;
  });
  return result;
};

export default flattenVariables;