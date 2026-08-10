export function text(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? "";
}

export function clear(element) {
  while (element?.firstChild) element.firstChild.remove();
}

export function make(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

export function listItems(targetId, values, fallback) {
  const target = document.getElementById(targetId);
  clear(target);
  const items = values.length ? values : [fallback];
  items.forEach((value) => target.append(make("li", "", value)));
}
