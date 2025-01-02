## Example

```javascript
import { traceThat, registerToken } from "tracethat.dev";

registerToken("your_token");

const hello = (name) => {
  return `Hello ${name}!`;
};

traceThat(hello)("world");
```

## Reference

### traceThat

`traceThat` is a function that wraps a function and logs its execution, whenever this function is called.

Optionally it accepts a string argument to indicate the name of the function e.g.

```javascript
const hello = traceThat("hello", (name) => {
  return `Hello ${name}!`;
});
```

### registerToken

In order to make the events accessible to you only, you need to register your token.
It can be any value but it's recommended to use a cryptographically secure random string.

```javascript
registerToken("your_token");
```

Alternatively, you can set the `TT_TOKEN` environment variable.
