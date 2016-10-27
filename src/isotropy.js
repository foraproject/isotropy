import * as acorn from "acorn";

/*
  Parse the general form hello.world.someFn(x, y, 20)
  or hello.world.someProp
  or justSomeProp

  hello.world.someFn(x, y, 20) is this AST:
  {
    "type": "Program",
    "start": 0,
    "end": 28,
    "body": [
      {
        "type": "ExpressionStatement",
        "start": 0,
        "end": 28,
        "expression": {
          "type": "CallExpression",
          "start": 0,
          "end": 28,
          "callee": {
            "type": "MemberExpression",
            "start": 0,
            "end": 18,
            "object": {
              "type": "MemberExpression",
              "start": 0,
              "end": 11,
              "object": {
                "type": "Identifier",
                "start": 0,
                "end": 5,
                "name": "hello"
              },
              "property": {
                "type": "Identifier",
                "start": 6,
                "end": 11,
                "name": "world"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "start": 12,
              "end": 18,
              "name": "someFn"
            },
            "computed": false
          },
          "arguments": [
            {
              "type": "Identifier",
              "start": 19,
              "end": 20,
              "name": "x"
            },
            {
              "type": "Identifier",
              "start": 22,
              "end": 23,
              "name": "y"
            },
            {
              "type": "Literal",
              "start": 25,
              "end": 27,
              "value": 20,
              "raw": "20"
            }
          ]
        }
      }
    ],
    "sourceType": "module"

  hello.world.someProp is this AST:
  {
    "type": "ExpressionStatement",
    "start": 0,
    "end": 20,
    "expression": {
      "type": "MemberExpression",
      "start": 0,
      "end": 20,
      "object": {
        "type": "MemberExpression",
        "start": 0,
        "end": 11,
        "object": {
          "type": "Identifier",
          "start": 0,
          "end": 5,
          "name": "hello"
        },
        "property": {
          "type": "Identifier",
          "start": 6,
          "end": 11,
          "name": "world"
        },
        "computed": false
      },
      "property": {
        "type": "Identifier",
        "start": 12,
        "end": 20,
        "name": "someProp"
      },
      "computed": false
    }
  }

  justSomeProp is this AST
  {
    "type": "ExpressionStatement",
    "start": 0,
    "end": 5,
    "expression": {
      "type": "Identifier",
      "start": 0,
      "end": 5,
      "name": "justSomeProp"
    }
  }
*/
export async function invoke(strInvoke, app, argsDict = {}, options = { default: "index" }) {
  strInvoke = strInvoke || options.default;

  const ast = acorn.parse(strInvoke);

  const expressionStatement = ast.body[0];
  if (expressionStatement.type !== "ExpressionStatement") {
    throw new Error(`Expected ExpressionStatement but got ${expressionStatement.type}.`);
  }

  const fnToInvoke = expressionStatement.expression.type === "CallExpression" ? invokeCallExpression :
    expressionStatement.expression.type === "MemberExpression" ? invokeMemberExpression :
    expressionStatement.expression.type === "Identifier" ? invokeIdentifer :
    undefined;

  if (!fnToInvoke) {
    throw new Error(`Expected CallExpression, MemberExpression or Identifier but got ${expressionStatement.expression.type}.`);
  }

  const result = fnToInvoke(expressionStatement.expression, app, argsDict);
  return result instanceof Promise ? (await result) : result;
}


/*
  Invokes app.hello.world.someFn(...) with the correct arguments.
  The thisPtr in someFn is set to world.
*/
function invokeCallExpression(callExpression, app, argsDict) {
  const memberExpression = callExpression.callee;
  const functionPath = getPathFromMemberExpression(memberExpression);
  const [fnPtr, thisPtr] = functionPath.reduce(([_fn, _this], item) =>  [_fn[item], _fn], [app, undefined])

  const args = callExpression.arguments.map(a => {
    if (a.type === "Identifier") {
      return argsDict[a.name];
    } else if (a.type === "Literal") {
      return a.value;
    } else {
      throw new Error(`Expected Identifier or Literal but got ${a.type}.`);
    }
  });

  return fnPtr.apply(thisPtr, args)
}


/*
  Gets the property or field app.hello.world.someProp.
*/
function invokeMemberExpression(memberExpression, app) {
  let exprPath = getPathFromMemberExpression(memberExpression);
  return exprPath.reduce((current, item) => current[item], app);
}


/*
  Gets app.someProp
*/
function invokeIdentifer(identifier, app) {
  return app[identifier.name];
}


/*
  Converts a nested memberExpression into ["hello", "world", "prop1"]
*/
function getPathFromMemberExpression(expr, acc = []) {
  if (expr.type === "Identifier") {
    return acc.concat(expr.name);
  } else if (expr.type === "MemberExpression") {
    return acc.concat(getPathFromMemberExpression(expr.object, acc)).concat(expr.property.name);
  } else {
    throw new Error(`Expected MemberExpression or Identifier but get ${expr.type}.`);
  }
}
