export type ConstructorProps<T> = T extends {
  new(...args: infer U): any;
} ? U : never;
