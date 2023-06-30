import { track, trigger } from "./effect";
import { hasChanged, isObject } from "../utils";
export function ref(value) {
  if (isRef(value)) {
    return value;
  }
  return new RefImpl(value);
}

export function isRef(value) {
  return !!(value && value.__isRef);
}

class RefImpl {
  constructor(value) {
    this.__isRef = true;
    this._value = convert(value);
  }
  get value() {
    track(this, "value");
    return this._value;
  }
  set value(value) {
    if (hasChanged(newValue, this._value)) {
      this._value = newValue;
      trigger(this, "value");
    }
    this._value = value;
    trigger(this, "value");
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}
