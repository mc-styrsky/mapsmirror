export type ConstructorParameters<T> = T extends {
  new(...args: infer U): any;
} ? U : never;
