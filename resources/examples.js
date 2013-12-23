function EvalApp(stdout, prompt, caller) {
  stdout("Welcome to the eval application");
  return function process(stdin) {
    stdout(eval(stdin));
    return process;
  }
}

function RouterApp(stdout, prompt, caller) {
  stdout("Terminal active. Type 'keygen' to generate RSA keys.");
  return function process(stdin) {
    switch (stdin) {
    case undefined:
      prompt("");
      return process;
    case "keygen":
      return KeyGenApp.entry(stdout, prompt, process);
    default:
      stdout("Unknown command.");
      return process;
    }
  }
}

var KeyGenApp = {
  entry: function(stdout, prompt, caller) {
    function print() {
      stdout(" ", "Welcome to the RSA keygen app.", " ", "Do you wish to generate and export an OpenPGP style key, or just generate the key?", " ");
      stdout("1) Key Generation and OpenPGP Key Export", "2) Key Generation", " ");
    }

    prompt("keygen");
    print();

    return function process(stdin) {
      if (stdin == 1)
        return KeyGenApp.enterName(stdout, prompt, caller);
      if (stdin == 2)
        return KeyGenApp.enterKeySize(stdout, prompt, caller);

      stdout(" ", "Invalid option. Please select one of the presented options.", " ");
      print();
      return process;
    }
  },

  exit: function(stdout, prompt, caller) {
    stdout("Goodbye");
    return caller();
  },

  enterName: function(stdout, prompt, caller) {
    function print() {
      stdout(" ", "Enter a name. E.g. Bob, Mike, Bob Smith <bob@smith.com>", " ");
    }

    print();

    return function process(stdin) {
      if (stdin.length > 2 && stdin.length < 250)
        return KeyGenApp.enterKeySize(stdout, prompt, caller);

      stdout(" ", "Invalid input. Name must be between 3 and 250 characters long.", " ");
      print();
      return process;
    }
  },

  enterKeySize: function(stdout, prompt, caller) {
    function print() {
      stdout(" ", "Enter a key size in bits, e.g. 1024, 1536, 2048", " ");
    }

    print();

    return function process(stdin) {
      if (stdin > 127 && stdin < 4097) {
        stdout(" ", "You chose: " + stdin, " ");
        return KeyGenApp.exit(stdout, prompt, caller);
      }

      stdout(" ", "Invalid input. Size must be between 128 and 4096 bits long.");
      print();
      return process;
    }
  },
}