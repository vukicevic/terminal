function Terminal(container, state) {
  var term = container.appendChild(document.createElement("dl")),
      input = term.appendChild(document.createElement("dt")),
      field = term.appendChild(document.createElement("dd")),
      caret = field.appendChild(document.createElement("span")),
      clock = input.appendChild(document.createElement('span')),
      label = input.appendChild(document.createElement('span'));

  clock.date = new Date();
  clock.textContent = clock.date.toString().substring(16,24);
  clock.classList.add("clock");

  window.setInterval(function() { 
    clock.date.setTime(Date.now());
    clock.textContent = clock.date.toString().substring(16, 24);
  }, 1000);

  caret.timer = window.setInterval(toggleCaret, 600);
  caret.textContent = " ";
  caret.line = 0;
  caret.pntr = 0;

  label.textContent = "[input]";
  
  window.addEventListener("keydown", control, true);
  window.addEventListener("keypress", write, true);
  window.addEventListener("focus", function() { caret.classList.remove("nofocus"); }, true);
  window.addEventListener("blur", function() { caret.classList.add("nofocus"); }, true);
  
  state = state(function(data) { return insertText(data, "stdout"); }, 
                function(data) { return insertText(data, "stderr"); });
  
  function toggleCaret(highlight) {
    if (highlight || !caret.classList.contains("highlight"))
      caret.classList.add("highlight");
    else
      caret.classList.remove("highlight");

    if (highlight) {
      window.clearInterval(caret.timer);
      caret.timer = window.setInterval(toggleCaret, 600);
    }
  }

  function toggleLineNumbers() {
    term.style.marginLeft = (term.style.marginLeft == "0px") ? "-3em" : "0px";
  }

  function control(event) {
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
        if (!moveLeft()) toggleLineNumbers();
      break;
      case 39:
        moveRight();
      break;
      case 38:
        event.preventDefault();
        if (caret.pntr > 0) { 
          clearLine();
          caret.parentNode.insertBefore(document.createTextNode(term.querySelectorAll("dd.stdin")[--caret.pntr].textContent.trim()), caret);
        }
      break;
      case 40:
        event.preventDefault();
        var lines = term.querySelectorAll("dd.stdin");
        if (caret.pntr < lines.length) {
          clearLine();
          if (++caret.pntr < lines.length)
            caret.parentNode.insertBefore(document.createTextNode(lines[caret.pntr].textContent.trim()), caret);
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
    if (event.which < 32) return;
    if (!caret.previousSibling) {
      caret.parentNode.insertBefore(document.createTextNode(String.fromCharCode(event.which)), caret);
    } else {
      caret.previousSibling.textContent = caret.previousSibling.textContent + String.fromCharCode(event.which);
    }
  }

  function execute() {
    while(moveRight());
    if (caret.parentNode.textContent == " ") return;
    state(insertLine(caret.line++, clock.textContent, label.textContent, caret.previousSibling.textContent, "stdin").trim());
    clearLine();
    input.scrollIntoView();
  
    caret.pntr = term.querySelectorAll("dd.stdin").length;
  }

  function insertLine(line, time, name, data, type) {
    var f = term.insertBefore(document.createElement("dt"), input),
        l = f.appendChild(document.createElement("span")),
        t = f.appendChild(document.createElement("span")),
        n = f.appendChild(document.createElement("span"));
    
    l.classList.add("line");
    l.appendChild(document.createTextNode(line));
    t.appendChild(document.createTextNode(time));
    n.appendChild(document.createTextNode(name));
    return insertText(data, type, line);
  }

  function insertText(data, type, id) {
    var f = term.insertBefore(document.createElement("dd"), input);
    
    f.setAttribute("id", id);
    if (type) f.classList.add(type);
    f.appendChild(document.createTextNode(data));
    return data;
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

  return {
    setLabel: function(text) {
      if(label.firstChild) label.removeChild(label.firstChild);
      label.appendChild(document.createTextNode(text));
    },
    read: function(line) {
      return document.getElementById(line) && document.getElementById(line).textContent.trim();
    },
    print: function(data, label) {
      return (label) ? insertLine(caret.line++, clock.textContent, label, data, "")
                    : insertText(data, "stdout");
    }
  };
}