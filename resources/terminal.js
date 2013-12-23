function Terminal(container, state) {
  var shell = container.appendChild(document.createElement("dl")),
      input = shell.appendChild(document.createElement("dt")),
      field = shell.appendChild(document.createElement("dd")),
      caret = field.appendChild(document.createElement("span")),
      label = input.appendChild(document.createElement('span')),
      alive = false;

  function toggleCaret(highlight) {
    if (highlight || !caret.classList.contains("highlight")) {
      caret.classList.add("highlight");
    } else {
      caret.classList.remove("highlight");
    }

    if (highlight) {
      window.clearInterval(caret.timer);
      caret.timer = window.setInterval(toggleCaret, 600);
    }
  }

  function insertText(data, type) {
    var f = shell.insertBefore(document.createElement("dd"), input);
    
    if (type) f.classList.add(type);
    return f.appendChild(document.createTextNode(data)).textContent;
  }

  function insertLine(prompt, data, type) {
    var f = shell.insertBefore(document.createElement("dt"), input),
        n = f.appendChild(document.createElement("span"));
    
    n.appendChild(document.createTextNode(prompt));
    return insertText(data, type);
  }

  function clearLine() {
    if (caret.previousSibling) caret.previousSibling.remove();
    if (caret.nextSibling) caret.nextSibling.remove();
    caret.textContent = " ";
  }

  function moveLeft(remove) {
    if (!caret.previousSibling || caret.previousSibling.textContent == "") return false;
    if (!remove) {
      if (!caret.nextSibling) caret.parentNode.appendChild(document.createTextNode(""));
      caret.nextSibling.textContent = caret.textContent + caret.nextSibling.textContent;
      caret.textContent = caret.previousSibling.textContent.substring(caret.previousSibling.textContent.length - 1);
    }
    caret.previousSibling.textContent = caret.previousSibling.textContent.substring(0, caret.previousSibling.textContent.length - 1);
    return true;
  }

  function moveRight(remove) {
    if (!caret.nextSibling || caret.nextSibling.textContent == "") return false;
    if (!remove) {
      if (!caret.previousSibling) caret.parentNode.insertBefore(document.createTextNode(""), caret);
      caret.previousSibling.textContent = caret.previousSibling.textContent + caret.textContent;
    }
    caret.textContent = caret.nextSibling.textContent.substring(0, 1);
    caret.nextSibling.textContent = caret.nextSibling.textContent.substring(1);
    return true;
  }

  function control(event) {
    if (!alive) return;
    toggleCaret(true);
    switch (event.which) {
      case 13:
        event.preventDefault();
        execute();
      break;
      case 8:
        moveLeft(true);
      break;
      case 46:
        moveRight(true);
      break;
      case 37:
        moveLeft();
      break;
      case 39:
        moveRight();
      break;
      case 38:
        event.preventDefault();
        if (caret.pointer > 0) { 
          clearLine();
          caret.parentNode.insertBefore(document.createTextNode(shell.querySelectorAll("dd.stdin")[--caret.pointer].textContent.trim()), caret);
        }
      break;
      case 40:
        event.preventDefault();
        var lines = shell.querySelectorAll("dd.stdin");
        if (caret.pointer < lines.length) {
          clearLine();
          if (++caret.pointer < lines.length)
            caret.parentNode.insertBefore(document.createTextNode(lines[caret.pointer].textContent.trim()), caret);
        }
      break;
      case 35:
        while(moveRight());
      break;
      case 36:
        while(moveLeft());
      break;
    }
  }

  function write(event) {
    if (!alive || event.which < 32) return;
    if (!caret.previousSibling) {
      caret.parentNode.insertBefore(document.createTextNode(String.fromCharCode(event.which)), caret);
    } else {
      caret.previousSibling.textContent = caret.previousSibling.textContent + String.fromCharCode(event.which);
    }
  }

  function execute() {
    while(moveRight());
    if (caret.parentNode.textContent == " ") return;

    state = state(insertLine(label.textContent, caret.previousSibling.textContent, "stdin").trim());

    clearLine();
    input.scrollIntoView();
  
    caret.pointer = shell.querySelectorAll("dd.stdin").length;
  }

  caret.timer = window.setInterval(toggleCaret, 600);
  caret.classList.add("nofocus");
  caret.textContent = " ";
  caret.pointer = 0;

  label.classList.add("label");

  window.addEventListener("keydown", control, true);
  window.addEventListener("keypress", write, true);
  window.addEventListener("click", function(e) { 
    alive = container.contains(e.target);
    if (alive) {
      caret.classList.remove("nofocus"); 
    } else { 
      caret.classList.add("nofocus"); 
    }
  }, true);

  state = state(function(data) { var args = Array.prototype.slice.call(arguments); while (args.length) insertText(args.shift(), "stdout"); }, 
                function(data) { if (label.firstChild) label.removeChild(label.firstChild); label.appendChild(document.createTextNode(data)); });

  return {
    setLabel: function(prompt) {
      if (label.firstChild) label.removeChild(label.firstChild);
      label.appendChild(document.createTextNode(prompt));
    },
    print: function(data, prompt) {
      return (prompt) ? insertLine(prompt, data, "") : insertText(data, "stdout");
    }
  };
}