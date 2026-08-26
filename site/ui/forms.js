import { clear, make } from "./dom.js";

const INTAKE_FIELD_IDS = {
  birthDate: "A1_birth_date",
  birthplace: "A2_birthplace",
  recordedTime: "A3_recorded_time",
  uncertaintyRange: "A4_uncertainty_range",
  boundaryFlags: "A5_boundary_flags",
  chartSex: "A6_chart_sex"
};

function optionValue(option) {
  return typeof option === "string" ? option : option.id;
}

function optionLabel(option) {
  return typeof option === "string" ? option : option.label;
}

function labelWithRequirement(question) {
  const label = document.createDocumentFragment();
  label.append(question.title);
  if (question.required) label.append(make("em", "", "必填"));
  return label;
}

function buildTextField(question) {
  const label = make("label", "field");
  const caption = make("span");
  caption.append(labelWithRequirement(question));
  const input = document.createElement("input");
  input.id = question.id;
  input.name = question.id;
  input.required = Boolean(question.required);
  input.type = question.inputType === "date" ? "date" : "text";
  if (question.inputType === "short_text") {
    input.maxLength = question.maxLength ?? 80;
    input.autocomplete = "off";
    input.placeholder = "城市，国家或地区";
  }
  label.append(caption, input);
  return label;
}

function buildTimeField(question) {
  const fieldset = make("fieldset", "time-choice-field");
  const legend = make("legend");
  legend.append(labelWithRequirement(question));
  const input = document.createElement("input");
  input.id = question.id;
  input.name = question.id;
  input.type = "time";
  input.required = Boolean(question.required);
  fieldset.append(legend, input);

  const unsure = question.options?.find((option) => optionValue(option) === "unsure");
  if (unsure) {
    const label = make("label", "time-unsure-option");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = `${question.id}_unsure`;
    checkbox.value = optionValue(unsure);
    checkbox.dataset.unsureTarget = question.id;
    label.append(checkbox, make("span", "", optionLabel(unsure)));
    fieldset.append(label);
  }
  return fieldset;
}

function buildChoiceField(question) {
  const multiple = question.inputType === "multi_choice";
  const fieldset = make("fieldset", multiple ? "boundary-field" : "choice-field compact-choice");
  const legend = make("legend");
  legend.append(labelWithRequirement(question));
  if (multiple) legend.append(make("small", "", "可多选，也可不选"));
  fieldset.append(legend);

  for (const option of question.options ?? []) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = multiple ? "checkbox" : "radio";
    input.name = question.id;
    input.value = optionValue(option);
    input.required = Boolean(question.required && !multiple);
    const copy = make("span");
    copy.append(make("strong", "", optionLabel(option)));
    label.append(input, copy);
    fieldset.append(label);
  }
  return fieldset;
}

export function renderIntakeForm(form, runtimeConfig) {
  const stage = runtimeConfig.question_bank.stages.find((item) => item.id === "birth_input");
  if (!stage) throw new Error("Birth intake configuration is missing.");
  const mount = form.querySelector("[data-intake-fields]");
  clear(mount);

  const primaryFields = make("div", "field-grid");
  const remainingFields = document.createDocumentFragment();
  for (const question of stage.questions) {
    if (["date", "short_text"].includes(question.inputType)) {
      primaryFields.append(buildTextField(question));
    } else if (question.inputType === "time_or_range") {
      remainingFields.append(buildTimeField(question));
    } else if (["single_choice", "multi_choice"].includes(question.inputType)) {
      remainingFields.append(buildChoiceField(question));
    }
  }
  mount.append(primaryFields, remainingFields);

  const defaultRange = form.querySelector(`input[name="${INTAKE_FIELD_IDS.uncertaintyRange}"][value="adjacent_1_shichen"]`);
  if (defaultRange) defaultRange.checked = true;
}

export function updateIntakeTimeState(form, changedInput) {
  if (!changedInput?.matches?.("[data-unsure-target]")) return;
  const timeInput = form.querySelector(`#${changedInput.dataset.unsureTarget}`);
  timeInput.disabled = changedInput.checked;
  timeInput.required = !changedInput.checked;
  if (changedInput.checked) timeInput.value = "";
}

function intakeValue(form, fieldId) {
  const controls = [...form.querySelectorAll(`[name="${fieldId}"]`)];
  if (controls[0]?.type === "radio") return controls.find((control) => control.checked)?.value ?? "";
  if (controls[0]?.type === "checkbox") return controls.filter((control) => control.checked).map((control) => control.value);
  return controls[0]?.value.trim() ?? "";
}

export function readIntakeForm(form) {
  const unsure = form.querySelector(`[name="${INTAKE_FIELD_IDS.recordedTime}_unsure"]`)?.checked;
  return {
    birth_date: intakeValue(form, INTAKE_FIELD_IDS.birthDate),
    birthplace: intakeValue(form, INTAKE_FIELD_IDS.birthplace),
    recorded_time: unsure ? "unsure" : intakeValue(form, INTAKE_FIELD_IDS.recordedTime),
    uncertainty_range: intakeValue(form, INTAKE_FIELD_IDS.uncertaintyRange),
    boundary_flags: intakeValue(form, INTAKE_FIELD_IDS.boundaryFlags),
    chart_sex: intakeValue(form, INTAKE_FIELD_IDS.chartSex)
  };
}

export function validateIntakeForm(form, runtimeConfig) {
  form.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
  const stage = runtimeConfig.question_bank.stages.find((item) => item.id === "birth_input");
  for (const question of stage?.questions ?? []) {
    if (!question.required) continue;
    const controls = [...form.querySelectorAll(`[name="${question.id}"]`)];
    const unsure = question.id === INTAKE_FIELD_IDS.recordedTime
      && form.querySelector(`[name="${question.id}_unsure"]`)?.checked;
    const hasValue = unsure || controls.some((control) => (
      ["radio", "checkbox"].includes(control.type) ? control.checked : Boolean(control.value.trim())
    ));
    if (hasValue) continue;
    controls.forEach((control) => control.setAttribute("aria-invalid", "true"));
    controls[0]?.focus();
    return question.title;
  }
  return "";
}

export function renderQuestionForm(form, question, savedValue) {
  clear(form);
  form.dataset.questionId = question.id;
  const type = question.inputType;

  if (type === "single_choice" || type === "multi_choice") {
    const options = make("fieldset", "answer-options");
    options.append(make("legend", "visually-hidden", question.title));
    const selected = Array.isArray(savedValue) ? new Set(savedValue) : new Set([savedValue]);
    for (const option of question.options ?? []) {
      const id = optionValue(option);
      const label = make("label", "answer-option");
      const input = document.createElement("input");
      input.type = type === "single_choice" ? "radio" : "checkbox";
      input.name = "answer";
      input.value = id;
      input.checked = selected.has(id);
      label.append(input, make("span", "", optionLabel(option)));
      options.append(label);
    }
    form.append(options);
  } else if (type === "year_event_list") {
    const editor = make("div", "event-editor");
    editor.dataset.maxItems = String(question.maxItems ?? 3);
    const existing = Array.isArray(savedValue) && savedValue.length ? savedValue : [{ year: "", description: "" }];
    existing.forEach((item) => addEventRow(editor, item, question));
    const add = make("button", "secondary-button event-add", "添加另一个年份");
    add.type = "button";
    add.addEventListener("click", () => {
      if (editor.querySelectorAll(".event-row").length < Number(editor.dataset.maxItems)) addEventRow(editor, {}, question);
      if (editor.querySelectorAll(".event-row").length >= Number(editor.dataset.maxItems)) add.disabled = true;
    });
    form.append(editor, add);
  } else {
    const stack = make("label", "answer-input-stack");
    stack.append(make("span", "visually-hidden", question.title));
    const input = type === "short_text" ? document.createElement("textarea") : document.createElement("input");
    input.name = "answer";
    input.value = typeof savedValue === "string" ? savedValue : "";
    if (type === "date") input.type = "date";
    else if (type === "time_or_range") input.type = "time";
    else {
      input.rows = 4;
      input.maxLength = question.maxLength ?? 500;
      input.placeholder = "可以简短回答；不知道或不愿回答也可以跳过。";
    }
    stack.append(input);
    form.append(stack);
  }
  const error = make("div", "answer-error");
  error.setAttribute("role", "alert");
  form.append(error);
}

function addEventRow(editor, item = {}, question = {}) {
  const row = make("div", "event-row");
  const year = document.createElement("input");
  year.type = "number";
  year.className = "event-year";
  year.inputMode = "numeric";
  year.min = "1900";
  year.max = String(new Date().getFullYear());
  year.placeholder = "年份";
  year.value = item.year ?? "";
  year.setAttribute("aria-label", "事件年份");
  const description = document.createElement("input");
  description.type = "text";
  description.className = "event-description";
  description.maxLength = 120;
  description.placeholder = "发生了什么（可选）";
  description.value = item.description ?? "";
  description.setAttribute("aria-label", "事件说明");
  const eventType = document.createElement("select");
  eventType.className = "event-type";
  eventType.setAttribute("aria-label", "事件性质");
  for (const option of question.eventTypeOptions ?? []) {
    const choice = document.createElement("option");
    choice.value = optionValue(option);
    choice.textContent = optionLabel(option);
    choice.selected = choice.value === item.event_type;
    eventType.append(choice);
  }
  const remove = make("button", "event-remove", "移除");
  remove.type = "button";
  remove.setAttribute("aria-label", "移除这个事件");
  remove.addEventListener("click", () => row.remove());
  row.append(year);
  if (eventType.options.length) row.append(eventType);
  row.append(description, remove);
  editor.append(row);
}

export function readQuestionValue(form, question) {
  if (question.inputType === "single_choice") return form.querySelector('input[name="answer"]:checked')?.value ?? "";
  if (question.inputType === "multi_choice") return [...form.querySelectorAll('input[name="answer"]:checked')].map((input) => input.value);
  if (question.inputType === "year_event_list") {
    return [...form.querySelectorAll(".event-row")]
      .map((row) => ({
        year: row.querySelector(".event-year").value,
        description: row.querySelector(".event-description").value.trim(),
        event_type: row.querySelector(".event-type")?.value ?? question.eventType,
        importance: "medium"
      }))
      .filter((item) => item.year)
      .map((item) => ({ ...item, year: Number(item.year) }));
  }
  return form.querySelector('[name="answer"]')?.value.trim() ?? "";
}
