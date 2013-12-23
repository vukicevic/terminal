function EchoApp(stdout, stderr, caller) {
  stdout("Welcome to the echo application");
  return function process(stdin) {
    if (stdin == "quit" && caller != null) return caller(stdout, stderr, null);
    stdout(stdin);
    return process;
  }
}

function EvalApp(stdout, stderr) {
  stdout("Welcome to the eval application");
  return function process(stdin) {
    stdout(eval(stdin));
    return process;
  }
}

function ConsoleApp(stdout, stderr) {
  stdout("Welcome to the console writer application");
  return function process(stdin) {
    console.log(stdin);
    return process;
  }
}