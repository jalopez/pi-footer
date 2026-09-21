import { registry } from "../widgets/registry.js";
import { getBooleanField, getNumberField, getTextField } from "./fields.js";
import { cycle } from "./helpers.js";
export function applyOptionFieldEdit(widget, field, edit) {
    if (field.kind !== "text")
        return "unchanged";
    if (edit.kind === "appendText") {
        widget.update({ [field.id]: getTextField(widget, field.id) + edit.text });
        return "changed";
    }
    widget.update({ [field.id]: getTextField(widget, field.id).slice(0, -1) });
    return "changed";
}
export function applyOptionField(widget, field, delta) {
    if (field.id === "enabled") {
        widget.toggle();
        return "changed";
    }
    if (field.editAction)
        return field.editAction;
    const properties = registry.spec(widget.type).properties;
    const property = properties.find((item) => item.id === field.id);
    if (property?.options?.editAction)
        return property.options.editAction;
    if (field.kind === "boolean" && isMetadataBooleanField(widget, field.id)) {
        metadataSetBooleanField(widget, field.id, !getBooleanField(widget, field.id));
        return "changed";
    }
    if (field.kind === "number") {
        if (property?.kind !== "number")
            return "unchanged";
        const min = field.min ?? property.options?.min ?? 1;
        const max = field.max ?? property.options?.max ?? 99;
        const current = getNumberField(widget, field.id) ?? min;
        metadataSetNumberField(widget, field.id, Math.min(max, Math.max(min, current + delta)));
        return "changed";
    }
    if (field.kind === "choice") {
        if (property?.kind !== "choice")
            return "unchanged";
        const choices = field.choices ?? property.options?.choices;
        const choiceIds = choices?.map((choice) => choice.id) ?? [];
        if (choiceIds.length === 0)
            return "unchanged";
        const current = getTextField(widget, field.id) || (choiceIds[0] ?? "");
        widget.update({ [field.id]: cycle(choiceIds, current, delta) });
        return "changed";
    }
    return "unchanged";
}
function metadataSetBooleanField(widget, id, value) {
    const spec = registry.spec(widget.type);
    const properties = spec.properties;
    const property = properties.find((item) => item.id === id);
    if (property?.kind === "boolean") {
        widget.update({ [id]: value });
        return;
    }
    if (!spec.baseOptions.some((option) => option === id))
        return;
    if (id === "raw")
        widget.update({ raw: value });
    if (id === "hideWhenEmpty")
        widget.update({ hideWhenEmpty: value });
    if (id === "hideWhenZero")
        widget.update({ hideWhenZero: value });
}
function metadataSetNumberField(widget, id, value) {
    const properties = registry.spec(widget.type).properties;
    const property = properties.find((item) => item.id === id);
    if (property?.kind === "number")
        widget.update({ [id]: value });
}
function isMetadataBooleanField(widget, id) {
    const spec = registry.spec(widget.type);
    const properties = spec.properties;
    const property = properties.find((item) => item.id === id);
    if (property?.kind === "boolean")
        return true;
    return (spec.baseOptions.some((option) => option === id) &&
        (id === "raw" || id === "hideWhenEmpty" || id === "hideWhenZero"));
}
