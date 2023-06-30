import { isFunction } from "../utils";
import { effect, trigger, track } from "./effect";

export function computed(getterOrOptions) {
  let getter, setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("computed is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedImpl(getter,setter);
}

class ComputedImpl {
  constructor(getter,setter) {
    this._setter = setter
    this._value = undefined;
    this._dirty = true;
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        this._dirty = true;
        trigger(this, "value");
      },
    });
  }

  get value() {
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
      track(this, "value");
    }
    return this._value;
  }

  set value(val) {
    // todo
    this._setter(new val)
  }
}
