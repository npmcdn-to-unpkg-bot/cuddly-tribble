/* */ 
"format cjs";
import { isPresent, isBlank, normalizeBool } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { PromiseWrapper } from 'angular2/src/facade/promise';
import { StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
/**
 * Indicates that a Control is valid, i.e. that no errors exist in the input value.
 */
export const VALID = "VALID";
/**
 * Indicates that a Control is invalid, i.e. that an error exists in the input value.
 */
export const INVALID = "INVALID";
/**
 * Indicates that a Control is pending, i.e. that async validation is occurring and
 * errors are not yet available for the input value.
 */
export const PENDING = "PENDING";
export function isControl(control) {
    return control instanceof AbstractControl;
}
function _find(control, path) {
    if (isBlank(path))
        return null;
    if (!(path instanceof Array)) {
        path = path.split("/");
    }
    if (path instanceof Array && ListWrapper.isEmpty(path))
        return null;
    return path
        .reduce((v, name) => {
        if (v instanceof ControlGroup) {
            return isPresent(v.controls[name]) ? v.controls[name] : null;
        }
        else if (v instanceof ControlArray) {
            var index = name;
            return isPresent(v.at(index)) ? v.at(index) : null;
        }
        else {
            return null;
        }
    }, control);
}
function toObservable(r) {
    return PromiseWrapper.isPromise(r) ? ObservableWrapper.fromPromise(r) : r;
}
/**
 *
 */
export class AbstractControl {
    constructor(validator, asyncValidator) {
        this.validator = validator;
        this.asyncValidator = asyncValidator;
        this._pristine = true;
        this._touched = false;
    }
    get value() { return this._value; }
    get status() { return this._status; }
    get valid() { return this._status === VALID; }
    /**
     * Returns the errors of this control.
     */
    get errors() { return this._errors; }
    get pristine() { return this._pristine; }
    get dirty() { return !this.pristine; }
    get touched() { return this._touched; }
    get untouched() { return !this._touched; }
    get valueChanges() { return this._valueChanges; }
    get statusChanges() { return this._statusChanges; }
    get pending() { return this._status == PENDING; }
    markAsTouched() { this._touched = true; }
    markAsDirty({ onlySelf } = {}) {
        onlySelf = normalizeBool(onlySelf);
        this._pristine = false;
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.markAsDirty({ onlySelf: onlySelf });
        }
    }
    markAsPending({ onlySelf } = {}) {
        onlySelf = normalizeBool(onlySelf);
        this._status = PENDING;
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.markAsPending({ onlySelf: onlySelf });
        }
    }
    setParent(parent) { this._parent = parent; }
    updateValueAndValidity({ onlySelf, emitEvent } = {}) {
        onlySelf = normalizeBool(onlySelf);
        emitEvent = isPresent(emitEvent) ? emitEvent : true;
        this._updateValue();
        this._errors = this._runValidator();
        this._status = this._calculateStatus();
        if (this._status == VALID || this._status == PENDING) {
            this._runAsyncValidator(emitEvent);
        }
        if (emitEvent) {
            ObservableWrapper.callEmit(this._valueChanges, this._value);
            ObservableWrapper.callEmit(this._statusChanges, this._status);
        }
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
        }
    }
    _runValidator() { return isPresent(this.validator) ? this.validator(this) : null; }
    _runAsyncValidator(emitEvent) {
        if (isPresent(this.asyncValidator)) {
            this._status = PENDING;
            this._cancelExistingSubscription();
            var obs = toObservable(this.asyncValidator(this));
            this._asyncValidationSubscription =
                ObservableWrapper.subscribe(obs, res => this.setErrors(res, { emitEvent: emitEvent }));
        }
    }
    _cancelExistingSubscription() {
        if (isPresent(this._asyncValidationSubscription)) {
            ObservableWrapper.dispose(this._asyncValidationSubscription);
        }
    }
    /**
     * Sets errors on a control.
     *
     * This is used when validations are run not automatically, but manually by the user.
     *
     * Calling `setErrors` will also update the validity of the parent control.
     *
     * ## Usage
     *
     * ```
     * var login = new Control("someLogin");
     * login.setErrors({
     *   "notUnique": true
     * });
     *
     * expect(login.valid).toEqual(false);
     * expect(login.errors).toEqual({"notUnique": true});
     *
     * login.updateValue("someOtherLogin");
     *
     * expect(login.valid).toEqual(true);
     * ```
     */
    setErrors(errors, { emitEvent } = {}) {
        emitEvent = isPresent(emitEvent) ? emitEvent : true;
        this._errors = errors;
        this._status = this._calculateStatus();
        if (emitEvent) {
            ObservableWrapper.callEmit(this._statusChanges, this._status);
        }
        if (isPresent(this._parent)) {
            this._parent._updateControlsErrors();
        }
    }
    find(path) { return _find(this, path); }
    getError(errorCode, path = null) {
        var control = isPresent(path) && !ListWrapper.isEmpty(path) ? this.find(path) : this;
        if (isPresent(control) && isPresent(control._errors)) {
            return StringMapWrapper.get(control._errors, errorCode);
        }
        else {
            return null;
        }
    }
    hasError(errorCode, path = null) {
        return isPresent(this.getError(errorCode, path));
    }
    get root() {
        let x = this;
        while (isPresent(x._parent)) {
            x = x._parent;
        }
        return x;
    }
    /** @internal */
    _updateControlsErrors() {
        this._status = this._calculateStatus();
        if (isPresent(this._parent)) {
            this._parent._updateControlsErrors();
        }
    }
    /** @internal */
    _initObservables() {
        this._valueChanges = new EventEmitter();
        this._statusChanges = new EventEmitter();
    }
    _calculateStatus() {
        if (isPresent(this._errors))
            return INVALID;
        if (this._anyControlsHaveStatus(PENDING))
            return PENDING;
        if (this._anyControlsHaveStatus(INVALID))
            return INVALID;
        return VALID;
    }
}
/**
 * Defines a part of a form that cannot be divided into other controls. `Control`s have values and
 * validation state, which is determined by an optional validation function.
 *
 * `Control` is one of the three fundamental building blocks used to define forms in Angular, along
 * with {@link ControlGroup} and {@link ControlArray}.
 *
 * ## Usage
 *
 * By default, a `Control` is created for every `<input>` or other form component.
 * With {@link NgFormControl} or {@link NgFormModel} an existing {@link Control} can be
 * bound to a DOM element instead. This `Control` can be configured with a custom
 * validation function.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
export class Control extends AbstractControl {
    constructor(value = null, validator = null, asyncValidator = null) {
        super(validator, asyncValidator);
        this._value = value;
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this._initObservables();
    }
    /**
     * Set the value of the control to `value`.
     *
     * If `onlySelf` is `true`, this change will only affect the validation of this `Control`
     * and not its parent component. If `emitEvent` is `true`, this change will cause a
     * `valueChanges` event on the `Control` to be emitted. Both of these options default to
     * `false`.
     *
     * If `emitModelToViewChange` is `true`, the view will be notified about the new value
     * via an `onChange` event. This is the default behavior if `emitModelToViewChange` is not
     * specified.
     */
    updateValue(value, { onlySelf, emitEvent, emitModelToViewChange } = {}) {
        emitModelToViewChange = isPresent(emitModelToViewChange) ? emitModelToViewChange : true;
        this._value = value;
        if (isPresent(this._onChange) && emitModelToViewChange)
            this._onChange(this._value);
        this.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
    }
    /**
     * @internal
     */
    _updateValue() { }
    /**
     * @internal
     */
    _anyControlsHaveStatus(status) { return false; }
    /**
     * Register a listener for change events.
     */
    registerOnChange(fn) { this._onChange = fn; }
}
/**
 * Defines a part of a form, of fixed length, that can contain other controls.
 *
 * A `ControlGroup` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls in a group is invalid, the entire group is invalid. Similarly, if a control
 * changes its value, the entire group changes as well.
 *
 * `ControlGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link Control} and {@link ControlArray}. {@link ControlArray} can also contain other
 * controls, but is of variable length.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
export class ControlGroup extends AbstractControl {
    constructor(controls, optionals = null, validator = null, asyncValidator = null) {
        super(validator, asyncValidator);
        this.controls = controls;
        this._optionals = isPresent(optionals) ? optionals : {};
        this._initObservables();
        this._setParentForControls();
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    /**
     * Add a control to this group.
     */
    addControl(name, control) {
        this.controls[name] = control;
        control.setParent(this);
    }
    /**
     * Remove a control from this group.
     */
    removeControl(name) { StringMapWrapper.delete(this.controls, name); }
    /**
     * Mark the named control as non-optional.
     */
    include(controlName) {
        StringMapWrapper.set(this._optionals, controlName, true);
        this.updateValueAndValidity();
    }
    /**
     * Mark the named control as optional.
     */
    exclude(controlName) {
        StringMapWrapper.set(this._optionals, controlName, false);
        this.updateValueAndValidity();
    }
    /**
     * Check whether there is a control with the given name in the group.
     */
    contains(controlName) {
        var c = StringMapWrapper.contains(this.controls, controlName);
        return c && this._included(controlName);
    }
    /** @internal */
    _setParentForControls() {
        StringMapWrapper.forEach(this.controls, (control, name) => { control.setParent(this); });
    }
    /** @internal */
    _updateValue() { this._value = this._reduceValue(); }
    /** @internal */
    _anyControlsHaveStatus(status) {
        var res = false;
        StringMapWrapper.forEach(this.controls, (control, name) => {
            res = res || (this.contains(name) && control.status == status);
        });
        return res;
    }
    /** @internal */
    _reduceValue() {
        return this._reduceChildren({}, (acc, control, name) => {
            acc[name] = control.value;
            return acc;
        });
    }
    /** @internal */
    _reduceChildren(initValue, fn) {
        var res = initValue;
        StringMapWrapper.forEach(this.controls, (control, name) => {
            if (this._included(name)) {
                res = fn(res, control, name);
            }
        });
        return res;
    }
    /** @internal */
    _included(controlName) {
        var isOptional = StringMapWrapper.contains(this._optionals, controlName);
        return !isOptional || StringMapWrapper.get(this._optionals, controlName);
    }
}
/**
 * Defines a part of a form, of variable length, that can contain other controls.
 *
 * A `ControlArray` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls in a group is invalid, the entire group is invalid. Similarly, if a control
 * changes its value, the entire group changes as well.
 *
 * `ControlArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link Control} and {@link ControlGroup}. {@link ControlGroup} can also contain
 * other controls, but is of fixed length.
 *
 * ## Adding or removing controls
 *
 * To change the controls in the array, use the `push`, `insert`, or `removeAt` methods
 * in `ControlArray` itself. These methods ensure the controls are properly tracked in the
 * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
 * the `ControlArray` directly, as that will result in strange and unexpected behavior such
 * as broken change detection.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
export class ControlArray extends AbstractControl {
    constructor(controls, validator = null, asyncValidator = null) {
        super(validator, asyncValidator);
        this.controls = controls;
        this._initObservables();
        this._setParentForControls();
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    /**
     * Get the {@link AbstractControl} at the given `index` in the array.
     */
    at(index) { return this.controls[index]; }
    /**
     * Insert a new {@link AbstractControl} at the end of the array.
     */
    push(control) {
        this.controls.push(control);
        control.setParent(this);
        this.updateValueAndValidity();
    }
    /**
     * Insert a new {@link AbstractControl} at the given `index` in the array.
     */
    insert(index, control) {
        ListWrapper.insert(this.controls, index, control);
        control.setParent(this);
        this.updateValueAndValidity();
    }
    /**
     * Remove the control at the given `index` in the array.
     */
    removeAt(index) {
        ListWrapper.removeAt(this.controls, index);
        this.updateValueAndValidity();
    }
    /**
     * Length of the control array.
     */
    get length() { return this.controls.length; }
    /** @internal */
    _updateValue() { this._value = this.controls.map((control) => control.value); }
    /** @internal */
    _anyControlsHaveStatus(status) {
        return this.controls.some(c => c.status == status);
    }
    /** @internal */
    _setParentForControls() {
        this.controls.forEach((control) => { control.setParent(this); });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL21vZGVsLnRzIl0sIm5hbWVzIjpbImlzQ29udHJvbCIsIl9maW5kIiwidG9PYnNlcnZhYmxlIiwiQWJzdHJhY3RDb250cm9sIiwiQWJzdHJhY3RDb250cm9sLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RDb250cm9sLnZhbHVlIiwiQWJzdHJhY3RDb250cm9sLnN0YXR1cyIsIkFic3RyYWN0Q29udHJvbC52YWxpZCIsIkFic3RyYWN0Q29udHJvbC5lcnJvcnMiLCJBYnN0cmFjdENvbnRyb2wucHJpc3RpbmUiLCJBYnN0cmFjdENvbnRyb2wuZGlydHkiLCJBYnN0cmFjdENvbnRyb2wudG91Y2hlZCIsIkFic3RyYWN0Q29udHJvbC51bnRvdWNoZWQiLCJBYnN0cmFjdENvbnRyb2wudmFsdWVDaGFuZ2VzIiwiQWJzdHJhY3RDb250cm9sLnN0YXR1c0NoYW5nZXMiLCJBYnN0cmFjdENvbnRyb2wucGVuZGluZyIsIkFic3RyYWN0Q29udHJvbC5tYXJrQXNUb3VjaGVkIiwiQWJzdHJhY3RDb250cm9sLm1hcmtBc0RpcnR5IiwiQWJzdHJhY3RDb250cm9sLm1hcmtBc1BlbmRpbmciLCJBYnN0cmFjdENvbnRyb2wuc2V0UGFyZW50IiwiQWJzdHJhY3RDb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkiLCJBYnN0cmFjdENvbnRyb2wuX3J1blZhbGlkYXRvciIsIkFic3RyYWN0Q29udHJvbC5fcnVuQXN5bmNWYWxpZGF0b3IiLCJBYnN0cmFjdENvbnRyb2wuX2NhbmNlbEV4aXN0aW5nU3Vic2NyaXB0aW9uIiwiQWJzdHJhY3RDb250cm9sLnNldEVycm9ycyIsIkFic3RyYWN0Q29udHJvbC5maW5kIiwiQWJzdHJhY3RDb250cm9sLmdldEVycm9yIiwiQWJzdHJhY3RDb250cm9sLmhhc0Vycm9yIiwiQWJzdHJhY3RDb250cm9sLnJvb3QiLCJBYnN0cmFjdENvbnRyb2wuX3VwZGF0ZUNvbnRyb2xzRXJyb3JzIiwiQWJzdHJhY3RDb250cm9sLl9pbml0T2JzZXJ2YWJsZXMiLCJBYnN0cmFjdENvbnRyb2wuX2NhbGN1bGF0ZVN0YXR1cyIsIkNvbnRyb2wiLCJDb250cm9sLmNvbnN0cnVjdG9yIiwiQ29udHJvbC51cGRhdGVWYWx1ZSIsIkNvbnRyb2wuX3VwZGF0ZVZhbHVlIiwiQ29udHJvbC5fYW55Q29udHJvbHNIYXZlU3RhdHVzIiwiQ29udHJvbC5yZWdpc3Rlck9uQ2hhbmdlIiwiQ29udHJvbEdyb3VwIiwiQ29udHJvbEdyb3VwLmNvbnN0cnVjdG9yIiwiQ29udHJvbEdyb3VwLmFkZENvbnRyb2wiLCJDb250cm9sR3JvdXAucmVtb3ZlQ29udHJvbCIsIkNvbnRyb2xHcm91cC5pbmNsdWRlIiwiQ29udHJvbEdyb3VwLmV4Y2x1ZGUiLCJDb250cm9sR3JvdXAuY29udGFpbnMiLCJDb250cm9sR3JvdXAuX3NldFBhcmVudEZvckNvbnRyb2xzIiwiQ29udHJvbEdyb3VwLl91cGRhdGVWYWx1ZSIsIkNvbnRyb2xHcm91cC5fYW55Q29udHJvbHNIYXZlU3RhdHVzIiwiQ29udHJvbEdyb3VwLl9yZWR1Y2VWYWx1ZSIsIkNvbnRyb2xHcm91cC5fcmVkdWNlQ2hpbGRyZW4iLCJDb250cm9sR3JvdXAuX2luY2x1ZGVkIiwiQ29udHJvbEFycmF5IiwiQ29udHJvbEFycmF5LmNvbnN0cnVjdG9yIiwiQ29udHJvbEFycmF5LmF0IiwiQ29udHJvbEFycmF5LnB1c2giLCJDb250cm9sQXJyYXkuaW5zZXJ0IiwiQ29udHJvbEFycmF5LnJlbW92ZUF0IiwiQ29udHJvbEFycmF5Lmxlbmd0aCIsIkNvbnRyb2xBcnJheS5fdXBkYXRlVmFsdWUiLCJDb250cm9sQXJyYXkuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyIsIkNvbnRyb2xBcnJheS5fc2V0UGFyZW50Rm9yQ29udHJvbHMiXSwibWFwcGluZ3MiOiJPQUFPLEVBQWdCLFNBQVMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFDLE1BQU0sMEJBQTBCO09BQ2xGLEVBQWEsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQzlFLEVBQUMsY0FBYyxFQUFDLE1BQU0sNkJBQTZCO09BQ25ELEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO0FBRTVFOztHQUVHO0FBQ0gsYUFBYSxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBRTdCOztHQUVHO0FBQ0gsYUFBYSxPQUFPLEdBQUcsU0FBUyxDQUFDO0FBRWpDOzs7R0FHRztBQUNILGFBQWEsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUVqQywwQkFBMEIsT0FBZTtJQUN2Q0EsTUFBTUEsQ0FBQ0EsT0FBT0EsWUFBWUEsZUFBZUEsQ0FBQ0E7QUFDNUNBLENBQUNBO0FBRUQsZUFBZSxPQUF3QixFQUFFLElBQW9DO0lBQzNFQyxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUUvQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsWUFBWUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLElBQUlBLEdBQVlBLElBQUtBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQ25DQSxDQUFDQTtJQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxZQUFZQSxLQUFLQSxJQUFJQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUVwRUEsTUFBTUEsQ0FBMEJBLElBQUtBO1NBQ2hDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQTtRQUNkQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5QkEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDL0RBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxJQUFJQSxLQUFLQSxHQUFXQSxJQUFJQSxDQUFDQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO0lBQ0hBLENBQUNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0FBQ2xCQSxDQUFDQTtBQUVELHNCQUFzQixDQUFNO0lBQzFCQyxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxpQkFBaUJBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0FBQzVFQSxDQUFDQTtBQUVEOztHQUVHO0FBQ0g7SUFhRUMsWUFBbUJBLFNBQW1CQSxFQUFTQSxjQUF3QkE7UUFBcERDLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQVNBLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFVQTtRQUwvREEsY0FBU0EsR0FBWUEsSUFBSUEsQ0FBQ0E7UUFDMUJBLGFBQVFBLEdBQVlBLEtBQUtBLENBQUNBO0lBSXdDQSxDQUFDQTtJQUUzRUQsSUFBSUEsS0FBS0EsS0FBVUUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFeENGLElBQUlBLE1BQU1BLEtBQWFHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBRTdDSCxJQUFJQSxLQUFLQSxLQUFjSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV2REo7O09BRUdBO0lBQ0hBLElBQUlBLE1BQU1BLEtBQTJCSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUzREwsSUFBSUEsUUFBUUEsS0FBY00sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFbEROLElBQUlBLEtBQUtBLEtBQWNPLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBRS9DUCxJQUFJQSxPQUFPQSxLQUFjUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoRFIsSUFBSUEsU0FBU0EsS0FBY1MsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFbkRULElBQUlBLFlBQVlBLEtBQXNCVSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVsRVYsSUFBSUEsYUFBYUEsS0FBc0JXLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBO0lBRXBFWCxJQUFJQSxPQUFPQSxLQUFjWSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxJQUFJQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUxRFosYUFBYUEsS0FBV2EsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFL0NiLFdBQVdBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUNBLEdBQXlCQSxFQUFFQTtRQUMvQ2MsUUFBUUEsR0FBR0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBO1FBRXZCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURkLGFBQWFBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUNBLEdBQXlCQSxFQUFFQTtRQUNqRGUsUUFBUUEsR0FBR0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBO1FBRXZCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURmLFNBQVNBLENBQUNBLE1BQW1DQSxJQUFVZ0IsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFL0VoQixzQkFBc0JBLENBQ2xCQSxFQUFDQSxRQUFRQSxFQUFFQSxTQUFTQSxFQUFDQSxHQUE4Q0EsRUFBRUE7UUFDdkVpQixRQUFRQSxHQUFHQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUNuQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFFcERBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1FBRXBCQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtRQUNwQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUV2Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsT0FBT0EsSUFBSUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckRBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDckNBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2RBLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDNURBLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDaEVBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxzQkFBc0JBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLFFBQVFBLEVBQUVBLFNBQVNBLEVBQUVBLFNBQVNBLEVBQUNBLENBQUNBLENBQUNBO1FBQ2xGQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPakIsYUFBYUEsS0FBS2tCLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRW5GbEIsa0JBQWtCQSxDQUFDQSxTQUFrQkE7UUFDM0NtQixFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0E7WUFDdkJBLElBQUlBLENBQUNBLDJCQUEyQkEsRUFBRUEsQ0FBQ0E7WUFDbkNBLElBQUlBLEdBQUdBLEdBQUdBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xEQSxJQUFJQSxDQUFDQSw0QkFBNEJBO2dCQUM3QkEsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUFDQSxTQUFTQSxFQUFFQSxTQUFTQSxFQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzRkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT25CLDJCQUEyQkE7UUFDakNvQixFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSw0QkFBNEJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pEQSxpQkFBaUJBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLDRCQUE0QkEsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURwQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXNCR0E7SUFDSEEsU0FBU0EsQ0FBQ0EsTUFBNEJBLEVBQUVBLEVBQUNBLFNBQVNBLEVBQUNBLEdBQTBCQSxFQUFFQTtRQUM3RXFCLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO1FBRXBEQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUN0QkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUV2Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZEEsaUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNoRUEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLHFCQUFxQkEsRUFBRUEsQ0FBQ0E7UUFDdkNBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURyQixJQUFJQSxDQUFDQSxJQUFvQ0EsSUFBcUJzQixNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV6RnRCLFFBQVFBLENBQUNBLFNBQWlCQSxFQUFFQSxJQUFJQSxHQUFhQSxJQUFJQTtRQUMvQ3VCLElBQUlBLE9BQU9BLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3JGQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyREEsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUMxREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRHZCLFFBQVFBLENBQUNBLFNBQWlCQSxFQUFFQSxJQUFJQSxHQUFhQSxJQUFJQTtRQUMvQ3dCLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQ25EQSxDQUFDQTtJQUVEeEIsSUFBSUEsSUFBSUE7UUFDTnlCLElBQUlBLENBQUNBLEdBQW9CQSxJQUFJQSxDQUFDQTtRQUU5QkEsT0FBT0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDNUJBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNYQSxDQUFDQTtJQUVEekIsZ0JBQWdCQTtJQUNoQkEscUJBQXFCQTtRQUNuQjBCLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0E7UUFFdkNBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxxQkFBcUJBLEVBQUVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEMUIsZ0JBQWdCQTtJQUNoQkEsZ0JBQWdCQTtRQUNkMkIsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFDeENBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLFlBQVlBLEVBQUVBLENBQUNBO0lBQzNDQSxDQUFDQTtJQUdPM0IsZ0JBQWdCQTtRQUN0QjRCLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO1FBQzVDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO1FBQ3pEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO1FBQ3pEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNmQSxDQUFDQTtBQU9INUIsQ0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSCw2QkFBNkIsZUFBZTtJQUkxQzZCLFlBQVlBLEtBQUtBLEdBQVFBLElBQUlBLEVBQUVBLFNBQVNBLEdBQWFBLElBQUlBLEVBQUVBLGNBQWNBLEdBQWFBLElBQUlBO1FBQ3hGQyxNQUFNQSxTQUFTQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDcEJBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsRUFBRUEsU0FBU0EsRUFBRUEsS0FBS0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDaEVBLElBQUlBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0E7SUFDMUJBLENBQUNBO0lBRUREOzs7Ozs7Ozs7OztPQVdHQTtJQUNIQSxXQUFXQSxDQUFDQSxLQUFVQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSxTQUFTQSxFQUFFQSxxQkFBcUJBLEVBQUNBLEdBSWhFQSxFQUFFQTtRQUNKRSxxQkFBcUJBLEdBQUdBLFNBQVNBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsR0FBR0EscUJBQXFCQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN4RkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDcEJBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLHFCQUFxQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDcEZBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsRUFBRUEsU0FBU0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDMUVBLENBQUNBO0lBRURGOztPQUVHQTtJQUNIQSxZQUFZQSxLQUFJRyxDQUFDQTtJQUVqQkg7O09BRUdBO0lBQ0hBLHNCQUFzQkEsQ0FBQ0EsTUFBY0EsSUFBYUksTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFakVKOztPQUVHQTtJQUNIQSxnQkFBZ0JBLENBQUNBLEVBQVlBLElBQVVLLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQy9ETCxDQUFDQTtBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILGtDQUFrQyxlQUFlO0lBRy9DTSxZQUFtQkEsUUFBMENBLEVBQ2pEQSxTQUFTQSxHQUE2QkEsSUFBSUEsRUFBRUEsU0FBU0EsR0FBYUEsSUFBSUEsRUFDdEVBLGNBQWNBLEdBQWFBLElBQUlBO1FBQ3pDQyxNQUFNQSxTQUFTQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUhoQkEsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBa0NBO1FBSTNEQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxTQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUN4REEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUN4QkEsSUFBSUEsQ0FBQ0EscUJBQXFCQSxFQUFFQSxDQUFDQTtRQUM3QkEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxFQUFFQSxTQUFTQSxFQUFFQSxLQUFLQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUNsRUEsQ0FBQ0E7SUFFREQ7O09BRUdBO0lBQ0hBLFVBQVVBLENBQUNBLElBQVlBLEVBQUVBLE9BQXdCQTtRQUMvQ0UsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDOUJBLE9BQU9BLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQzFCQSxDQUFDQTtJQUVERjs7T0FFR0E7SUFDSEEsYUFBYUEsQ0FBQ0EsSUFBWUEsSUFBVUcsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVuRkg7O09BRUdBO0lBQ0hBLE9BQU9BLENBQUNBLFdBQW1CQTtRQUN6QkksZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxXQUFXQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN6REEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxFQUFFQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFREo7O09BRUdBO0lBQ0hBLE9BQU9BLENBQUNBLFdBQW1CQTtRQUN6QkssZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxXQUFXQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMxREEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxFQUFFQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFREw7O09BRUdBO0lBQ0hBLFFBQVFBLENBQUNBLFdBQW1CQTtRQUMxQk0sSUFBSUEsQ0FBQ0EsR0FBR0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM5REEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDMUNBLENBQUNBO0lBRUROLGdCQUFnQkE7SUFDaEJBLHFCQUFxQkE7UUFDbkJPLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsSUFBSUEsT0FBT0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDM0ZBLENBQUNBO0lBRURQLGdCQUFnQkE7SUFDaEJBLFlBQVlBLEtBQUtRLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXJEUixnQkFBZ0JBO0lBQ2hCQSxzQkFBc0JBLENBQUNBLE1BQWNBO1FBQ25DUyxJQUFJQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNoQkEsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQTtZQUNwREEsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsTUFBTUEsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDakVBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0lBQ2JBLENBQUNBO0lBRURULGdCQUFnQkE7SUFDaEJBLFlBQVlBO1FBQ1ZVLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLE9BQU9BLEVBQUVBLElBQUlBO1lBQ2pEQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMxQkEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDYkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFRFYsZ0JBQWdCQTtJQUNoQkEsZUFBZUEsQ0FBQ0EsU0FBY0EsRUFBRUEsRUFBWUE7UUFDMUNXLElBQUlBLEdBQUdBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ3BCQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBO1lBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekJBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1lBQy9CQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVEWCxnQkFBZ0JBO0lBQ2hCQSxTQUFTQSxDQUFDQSxXQUFtQkE7UUFDM0JZLElBQUlBLFVBQVVBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekVBLE1BQU1BLENBQUNBLENBQUNBLFVBQVVBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDM0VBLENBQUNBO0FBQ0haLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0gsa0NBQWtDLGVBQWU7SUFDL0NhLFlBQW1CQSxRQUEyQkEsRUFBRUEsU0FBU0EsR0FBYUEsSUFBSUEsRUFDOURBLGNBQWNBLEdBQWFBLElBQUlBO1FBQ3pDQyxNQUFNQSxTQUFTQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUZoQkEsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBbUJBO1FBRzVDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBO1FBQ3hCQSxJQUFJQSxDQUFDQSxxQkFBcUJBLEVBQUVBLENBQUNBO1FBQzdCQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLElBQUlBLEVBQUVBLFNBQVNBLEVBQUVBLEtBQUtBLEVBQUNBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQUVERDs7T0FFR0E7SUFDSEEsRUFBRUEsQ0FBQ0EsS0FBYUEsSUFBcUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRW5FRjs7T0FFR0E7SUFDSEEsSUFBSUEsQ0FBQ0EsT0FBd0JBO1FBQzNCRyxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUM1QkEsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLElBQUlBLENBQUNBLHNCQUFzQkEsRUFBRUEsQ0FBQ0E7SUFDaENBLENBQUNBO0lBRURIOztPQUVHQTtJQUNIQSxNQUFNQSxDQUFDQSxLQUFhQSxFQUFFQSxPQUF3QkE7UUFDNUNJLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEtBQUtBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQ2xEQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN4QkEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxFQUFFQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFREo7O09BRUdBO0lBQ0hBLFFBQVFBLENBQUNBLEtBQWFBO1FBQ3BCSyxXQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMzQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxFQUFFQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFREw7O09BRUdBO0lBQ0hBLElBQUlBLE1BQU1BLEtBQWFNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBRXJETixnQkFBZ0JBO0lBQ2hCQSxZQUFZQSxLQUFXTyxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxPQUFPQSxLQUFLQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyRlAsZ0JBQWdCQTtJQUNoQkEsc0JBQXNCQSxDQUFDQSxNQUFjQTtRQUNuQ1EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBR0RSLGdCQUFnQkE7SUFDaEJBLHFCQUFxQkE7UUFDbkJTLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLE9BQU9BLE9BQU9BLE9BQU9BLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ25FQSxDQUFDQTtBQUNIVCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBpc1ByZXNlbnQsIGlzQmxhbmssIG5vcm1hbGl6ZUJvb2x9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGUsIEV2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9wcm9taXNlJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgYSBDb250cm9sIGlzIHZhbGlkLCBpLmUuIHRoYXQgbm8gZXJyb3JzIGV4aXN0IGluIHRoZSBpbnB1dCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFZBTElEID0gXCJWQUxJRFwiO1xuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IGEgQ29udHJvbCBpcyBpbnZhbGlkLCBpLmUuIHRoYXQgYW4gZXJyb3IgZXhpc3RzIGluIHRoZSBpbnB1dCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IElOVkFMSUQgPSBcIklOVkFMSURcIjtcblxuLyoqXG4gKiBJbmRpY2F0ZXMgdGhhdCBhIENvbnRyb2wgaXMgcGVuZGluZywgaS5lLiB0aGF0IGFzeW5jIHZhbGlkYXRpb24gaXMgb2NjdXJyaW5nIGFuZFxuICogZXJyb3JzIGFyZSBub3QgeWV0IGF2YWlsYWJsZSBmb3IgdGhlIGlucHV0IHZhbHVlLlxuICovXG5leHBvcnQgY29uc3QgUEVORElORyA9IFwiUEVORElOR1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDb250cm9sKGNvbnRyb2w6IE9iamVjdCk6IGJvb2xlYW4ge1xuICByZXR1cm4gY29udHJvbCBpbnN0YW5jZW9mIEFic3RyYWN0Q29udHJvbDtcbn1cblxuZnVuY3Rpb24gX2ZpbmQoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBwYXRoOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+fCBzdHJpbmcpIHtcbiAgaWYgKGlzQmxhbmsocGF0aCkpIHJldHVybiBudWxsO1xuXG4gIGlmICghKHBhdGggaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXRoID0gKDxzdHJpbmc+cGF0aCkuc3BsaXQoXCIvXCIpO1xuICB9XG4gIGlmIChwYXRoIGluc3RhbmNlb2YgQXJyYXkgJiYgTGlzdFdyYXBwZXIuaXNFbXB0eShwYXRoKSkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuICg8QXJyYXk8c3RyaW5nIHwgbnVtYmVyPj5wYXRoKVxuICAgICAgLnJlZHVjZSgodiwgbmFtZSkgPT4ge1xuICAgICAgICBpZiAodiBpbnN0YW5jZW9mIENvbnRyb2xHcm91cCkge1xuICAgICAgICAgIHJldHVybiBpc1ByZXNlbnQodi5jb250cm9sc1tuYW1lXSkgPyB2LmNvbnRyb2xzW25hbWVdIDogbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh2IGluc3RhbmNlb2YgQ29udHJvbEFycmF5KSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gPG51bWJlcj5uYW1lO1xuICAgICAgICAgIHJldHVybiBpc1ByZXNlbnQodi5hdChpbmRleCkpID8gdi5hdChpbmRleCkgOiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCBjb250cm9sKTtcbn1cblxuZnVuY3Rpb24gdG9PYnNlcnZhYmxlKHI6IGFueSk6IE9ic2VydmFibGU8YW55PiB7XG4gIHJldHVybiBQcm9taXNlV3JhcHBlci5pc1Byb21pc2UocikgPyBPYnNlcnZhYmxlV3JhcHBlci5mcm9tUHJvbWlzZShyKSA6IHI7XG59XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0Q29udHJvbCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZhbHVlOiBhbnk7XG5cbiAgcHJpdmF0ZSBfdmFsdWVDaGFuZ2VzOiBFdmVudEVtaXR0ZXI8YW55PjtcbiAgcHJpdmF0ZSBfc3RhdHVzQ2hhbmdlczogRXZlbnRFbWl0dGVyPGFueT47XG4gIHByaXZhdGUgX3N0YXR1czogc3RyaW5nO1xuICBwcml2YXRlIF9lcnJvcnM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBwcml2YXRlIF9wcmlzdGluZTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX3RvdWNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfcGFyZW50OiBDb250cm9sR3JvdXAgfCBDb250cm9sQXJyYXk7XG4gIHByaXZhdGUgX2FzeW5jVmFsaWRhdGlvblN1YnNjcmlwdGlvbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsaWRhdG9yOiBGdW5jdGlvbiwgcHVibGljIGFzeW5jVmFsaWRhdG9yOiBGdW5jdGlvbikge31cblxuICBnZXQgdmFsdWUoKTogYW55IHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG5cbiAgZ2V0IHN0YXR1cygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fc3RhdHVzOyB9XG5cbiAgZ2V0IHZhbGlkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc3RhdHVzID09PSBWQUxJRDsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlcnJvcnMgb2YgdGhpcyBjb250cm9sLlxuICAgKi9cbiAgZ2V0IGVycm9ycygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLl9lcnJvcnM7IH1cblxuICBnZXQgcHJpc3RpbmUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9wcmlzdGluZTsgfVxuXG4gIGdldCBkaXJ0eSgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLnByaXN0aW5lOyB9XG5cbiAgZ2V0IHRvdWNoZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90b3VjaGVkOyB9XG5cbiAgZ2V0IHVudG91Y2hlZCgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLl90b3VjaGVkOyB9XG5cbiAgZ2V0IHZhbHVlQ2hhbmdlcygpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm4gdGhpcy5fdmFsdWVDaGFuZ2VzOyB9XG5cbiAgZ2V0IHN0YXR1c0NoYW5nZXMoKTogT2JzZXJ2YWJsZTxhbnk+IHsgcmV0dXJuIHRoaXMuX3N0YXR1c0NoYW5nZXM7IH1cblxuICBnZXQgcGVuZGluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXR1cyA9PSBQRU5ESU5HOyB9XG5cbiAgbWFya0FzVG91Y2hlZCgpOiB2b2lkIHsgdGhpcy5fdG91Y2hlZCA9IHRydWU7IH1cblxuICBtYXJrQXNEaXJ0eSh7b25seVNlbGZ9OiB7b25seVNlbGY/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgb25seVNlbGYgPSBub3JtYWxpemVCb29sKG9ubHlTZWxmKTtcbiAgICB0aGlzLl9wcmlzdGluZSA9IGZhbHNlO1xuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpICYmICFvbmx5U2VsZikge1xuICAgICAgdGhpcy5fcGFyZW50Lm1hcmtBc0RpcnR5KHtvbmx5U2VsZjogb25seVNlbGZ9KTtcbiAgICB9XG4gIH1cblxuICBtYXJrQXNQZW5kaW5nKHtvbmx5U2VsZn06IHtvbmx5U2VsZj86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBvbmx5U2VsZiA9IG5vcm1hbGl6ZUJvb2wob25seVNlbGYpO1xuICAgIHRoaXMuX3N0YXR1cyA9IFBFTkRJTkc7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkgJiYgIW9ubHlTZWxmKSB7XG4gICAgICB0aGlzLl9wYXJlbnQubWFya0FzUGVuZGluZyh7b25seVNlbGY6IG9ubHlTZWxmfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0UGFyZW50KHBhcmVudDogQ29udHJvbEdyb3VwIHwgQ29udHJvbEFycmF5KTogdm9pZCB7IHRoaXMuX3BhcmVudCA9IHBhcmVudDsgfVxuXG4gIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoXG4gICAgICB7b25seVNlbGYsIGVtaXRFdmVudH06IHtvbmx5U2VsZj86IGJvb2xlYW4sIGVtaXRFdmVudD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBvbmx5U2VsZiA9IG5vcm1hbGl6ZUJvb2wob25seVNlbGYpO1xuICAgIGVtaXRFdmVudCA9IGlzUHJlc2VudChlbWl0RXZlbnQpID8gZW1pdEV2ZW50IDogdHJ1ZTtcblxuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKCk7XG5cbiAgICB0aGlzLl9lcnJvcnMgPSB0aGlzLl9ydW5WYWxpZGF0b3IoKTtcbiAgICB0aGlzLl9zdGF0dXMgPSB0aGlzLl9jYWxjdWxhdGVTdGF0dXMoKTtcblxuICAgIGlmICh0aGlzLl9zdGF0dXMgPT0gVkFMSUQgfHwgdGhpcy5fc3RhdHVzID09IFBFTkRJTkcpIHtcbiAgICAgIHRoaXMuX3J1bkFzeW5jVmFsaWRhdG9yKGVtaXRFdmVudCk7XG4gICAgfVxuXG4gICAgaWYgKGVtaXRFdmVudCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fdmFsdWVDaGFuZ2VzLCB0aGlzLl92YWx1ZSk7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdGF0dXNDaGFuZ2VzLCB0aGlzLl9zdGF0dXMpO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcGFyZW50KSAmJiAhb25seVNlbGYpIHtcbiAgICAgIHRoaXMuX3BhcmVudC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogb25seVNlbGYsIGVtaXRFdmVudDogZW1pdEV2ZW50fSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcnVuVmFsaWRhdG9yKCkgeyByZXR1cm4gaXNQcmVzZW50KHRoaXMudmFsaWRhdG9yKSA/IHRoaXMudmFsaWRhdG9yKHRoaXMpIDogbnVsbDsgfVxuXG4gIHByaXZhdGUgX3J1bkFzeW5jVmFsaWRhdG9yKGVtaXRFdmVudDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5hc3luY1ZhbGlkYXRvcikpIHtcbiAgICAgIHRoaXMuX3N0YXR1cyA9IFBFTkRJTkc7XG4gICAgICB0aGlzLl9jYW5jZWxFeGlzdGluZ1N1YnNjcmlwdGlvbigpO1xuICAgICAgdmFyIG9icyA9IHRvT2JzZXJ2YWJsZSh0aGlzLmFzeW5jVmFsaWRhdG9yKHRoaXMpKTtcbiAgICAgIHRoaXMuX2FzeW5jVmFsaWRhdGlvblN1YnNjcmlwdGlvbiA9XG4gICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKG9icywgcmVzID0+IHRoaXMuc2V0RXJyb3JzKHJlcywge2VtaXRFdmVudDogZW1pdEV2ZW50fSkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NhbmNlbEV4aXN0aW5nU3Vic2NyaXB0aW9uKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fYXN5bmNWYWxpZGF0aW9uU3Vic2NyaXB0aW9uKSkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9hc3luY1ZhbGlkYXRpb25TdWJzY3JpcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGVycm9ycyBvbiBhIGNvbnRyb2wuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCB3aGVuIHZhbGlkYXRpb25zIGFyZSBydW4gbm90IGF1dG9tYXRpY2FsbHksIGJ1dCBtYW51YWxseSBieSB0aGUgdXNlci5cbiAgICpcbiAgICogQ2FsbGluZyBgc2V0RXJyb3JzYCB3aWxsIGFsc28gdXBkYXRlIHRoZSB2YWxpZGl0eSBvZiB0aGUgcGFyZW50IGNvbnRyb2wuXG4gICAqXG4gICAqICMjIFVzYWdlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgbG9naW4gPSBuZXcgQ29udHJvbChcInNvbWVMb2dpblwiKTtcbiAgICogbG9naW4uc2V0RXJyb3JzKHtcbiAgICogICBcIm5vdFVuaXF1ZVwiOiB0cnVlXG4gICAqIH0pO1xuICAgKlxuICAgKiBleHBlY3QobG9naW4udmFsaWQpLnRvRXF1YWwoZmFsc2UpO1xuICAgKiBleHBlY3QobG9naW4uZXJyb3JzKS50b0VxdWFsKHtcIm5vdFVuaXF1ZVwiOiB0cnVlfSk7XG4gICAqXG4gICAqIGxvZ2luLnVwZGF0ZVZhbHVlKFwic29tZU90aGVyTG9naW5cIik7XG4gICAqXG4gICAqIGV4cGVjdChsb2dpbi52YWxpZCkudG9FcXVhbCh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICBzZXRFcnJvcnMoZXJyb3JzOiB7W2tleTogc3RyaW5nXTogYW55fSwge2VtaXRFdmVudH06IHtlbWl0RXZlbnQ/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgZW1pdEV2ZW50ID0gaXNQcmVzZW50KGVtaXRFdmVudCkgPyBlbWl0RXZlbnQgOiB0cnVlO1xuXG4gICAgdGhpcy5fZXJyb3JzID0gZXJyb3JzO1xuICAgIHRoaXMuX3N0YXR1cyA9IHRoaXMuX2NhbGN1bGF0ZVN0YXR1cygpO1xuXG4gICAgaWYgKGVtaXRFdmVudCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3RhdHVzQ2hhbmdlcywgdGhpcy5fc3RhdHVzKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkpIHtcbiAgICAgIHRoaXMuX3BhcmVudC5fdXBkYXRlQ29udHJvbHNFcnJvcnMoKTtcbiAgICB9XG4gIH1cblxuICBmaW5kKHBhdGg6IEFycmF5PHN0cmluZyB8IG51bWJlcj58IHN0cmluZyk6IEFic3RyYWN0Q29udHJvbCB7IHJldHVybiBfZmluZCh0aGlzLCBwYXRoKTsgfVxuXG4gIGdldEVycm9yKGVycm9yQ29kZTogc3RyaW5nLCBwYXRoOiBzdHJpbmdbXSA9IG51bGwpOiBhbnkge1xuICAgIHZhciBjb250cm9sID0gaXNQcmVzZW50KHBhdGgpICYmICFMaXN0V3JhcHBlci5pc0VtcHR5KHBhdGgpID8gdGhpcy5maW5kKHBhdGgpIDogdGhpcztcbiAgICBpZiAoaXNQcmVzZW50KGNvbnRyb2wpICYmIGlzUHJlc2VudChjb250cm9sLl9lcnJvcnMpKSB7XG4gICAgICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5nZXQoY29udHJvbC5fZXJyb3JzLCBlcnJvckNvZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBoYXNFcnJvcihlcnJvckNvZGU6IHN0cmluZywgcGF0aDogc3RyaW5nW10gPSBudWxsKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmdldEVycm9yKGVycm9yQ29kZSwgcGF0aCkpO1xuICB9XG5cbiAgZ2V0IHJvb3QoKTogQWJzdHJhY3RDb250cm9sIHtcbiAgICBsZXQgeDogQWJzdHJhY3RDb250cm9sID0gdGhpcztcblxuICAgIHdoaWxlIChpc1ByZXNlbnQoeC5fcGFyZW50KSkge1xuICAgICAgeCA9IHguX3BhcmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4geDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZUNvbnRyb2xzRXJyb3JzKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXR1cyA9IHRoaXMuX2NhbGN1bGF0ZVN0YXR1cygpO1xuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpKSB7XG4gICAgICB0aGlzLl9wYXJlbnQuX3VwZGF0ZUNvbnRyb2xzRXJyb3JzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5pdE9ic2VydmFibGVzKCkge1xuICAgIHRoaXMuX3ZhbHVlQ2hhbmdlcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdGF0dXNDaGFuZ2VzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB9XG5cblxuICBwcml2YXRlIF9jYWxjdWxhdGVTdGF0dXMoKTogc3RyaW5nIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2Vycm9ycykpIHJldHVybiBJTlZBTElEO1xuICAgIGlmICh0aGlzLl9hbnlDb250cm9sc0hhdmVTdGF0dXMoUEVORElORykpIHJldHVybiBQRU5ESU5HO1xuICAgIGlmICh0aGlzLl9hbnlDb250cm9sc0hhdmVTdGF0dXMoSU5WQUxJRCkpIHJldHVybiBJTlZBTElEO1xuICAgIHJldHVybiBWQUxJRDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgYWJzdHJhY3QgX3VwZGF0ZVZhbHVlKCk6IHZvaWQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBhYnN0cmFjdCBfYW55Q29udHJvbHNIYXZlU3RhdHVzKHN0YXR1czogc3RyaW5nKTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgcGFydCBvZiBhIGZvcm0gdGhhdCBjYW5ub3QgYmUgZGl2aWRlZCBpbnRvIG90aGVyIGNvbnRyb2xzLiBgQ29udHJvbGBzIGhhdmUgdmFsdWVzIGFuZFxuICogdmFsaWRhdGlvbiBzdGF0ZSwgd2hpY2ggaXMgZGV0ZXJtaW5lZCBieSBhbiBvcHRpb25hbCB2YWxpZGF0aW9uIGZ1bmN0aW9uLlxuICpcbiAqIGBDb250cm9sYCBpcyBvbmUgb2YgdGhlIHRocmVlIGZ1bmRhbWVudGFsIGJ1aWxkaW5nIGJsb2NrcyB1c2VkIHRvIGRlZmluZSBmb3JtcyBpbiBBbmd1bGFyLCBhbG9uZ1xuICogd2l0aCB7QGxpbmsgQ29udHJvbEdyb3VwfSBhbmQge0BsaW5rIENvbnRyb2xBcnJheX0uXG4gKlxuICogIyMgVXNhZ2VcbiAqXG4gKiBCeSBkZWZhdWx0LCBhIGBDb250cm9sYCBpcyBjcmVhdGVkIGZvciBldmVyeSBgPGlucHV0PmAgb3Igb3RoZXIgZm9ybSBjb21wb25lbnQuXG4gKiBXaXRoIHtAbGluayBOZ0Zvcm1Db250cm9sfSBvciB7QGxpbmsgTmdGb3JtTW9kZWx9IGFuIGV4aXN0aW5nIHtAbGluayBDb250cm9sfSBjYW4gYmVcbiAqIGJvdW5kIHRvIGEgRE9NIGVsZW1lbnQgaW5zdGVhZC4gVGhpcyBgQ29udHJvbGAgY2FuIGJlIGNvbmZpZ3VyZWQgd2l0aCBhIGN1c3RvbVxuICogdmFsaWRhdGlvbiBmdW5jdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvMjNERVNPcGJObkJwQkhadDFCUjQ/cD1wcmV2aWV3KSlcbiAqL1xuZXhwb3J0IGNsYXNzIENvbnRyb2wgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2wge1xuICAvKiogQGludGVybmFsICovXG4gIF9vbkNoYW5nZTogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IodmFsdWU6IGFueSA9IG51bGwsIHZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsLCBhc3luY1ZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgc3VwZXIodmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgdGhpcy5faW5pdE9ic2VydmFibGVzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB2YWx1ZSBvZiB0aGUgY29udHJvbCB0byBgdmFsdWVgLlxuICAgKlxuICAgKiBJZiBgb25seVNlbGZgIGlzIGB0cnVlYCwgdGhpcyBjaGFuZ2Ugd2lsbCBvbmx5IGFmZmVjdCB0aGUgdmFsaWRhdGlvbiBvZiB0aGlzIGBDb250cm9sYFxuICAgKiBhbmQgbm90IGl0cyBwYXJlbnQgY29tcG9uZW50LiBJZiBgZW1pdEV2ZW50YCBpcyBgdHJ1ZWAsIHRoaXMgY2hhbmdlIHdpbGwgY2F1c2UgYVxuICAgKiBgdmFsdWVDaGFuZ2VzYCBldmVudCBvbiB0aGUgYENvbnRyb2xgIHRvIGJlIGVtaXR0ZWQuIEJvdGggb2YgdGhlc2Ugb3B0aW9ucyBkZWZhdWx0IHRvXG4gICAqIGBmYWxzZWAuXG4gICAqXG4gICAqIElmIGBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2VgIGlzIGB0cnVlYCwgdGhlIHZpZXcgd2lsbCBiZSBub3RpZmllZCBhYm91dCB0aGUgbmV3IHZhbHVlXG4gICAqIHZpYSBhbiBgb25DaGFuZ2VgIGV2ZW50LiBUaGlzIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIGlmIGBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2VgIGlzIG5vdFxuICAgKiBzcGVjaWZpZWQuXG4gICAqL1xuICB1cGRhdGVWYWx1ZSh2YWx1ZTogYW55LCB7b25seVNlbGYsIGVtaXRFdmVudCwgZW1pdE1vZGVsVG9WaWV3Q2hhbmdlfToge1xuICAgIG9ubHlTZWxmPzogYm9vbGVhbixcbiAgICBlbWl0RXZlbnQ/OiBib29sZWFuLFxuICAgIGVtaXRNb2RlbFRvVmlld0NoYW5nZT86IGJvb2xlYW5cbiAgfSA9IHt9KTogdm9pZCB7XG4gICAgZW1pdE1vZGVsVG9WaWV3Q2hhbmdlID0gaXNQcmVzZW50KGVtaXRNb2RlbFRvVmlld0NoYW5nZSkgPyBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2UgOiB0cnVlO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vbkNoYW5nZSkgJiYgZW1pdE1vZGVsVG9WaWV3Q2hhbmdlKSB0aGlzLl9vbkNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogb25seVNlbGYsIGVtaXRFdmVudDogZW1pdEV2ZW50fSk7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfdXBkYXRlVmFsdWUoKSB7fVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIGNoYW5nZSBldmVudHMuXG4gICAqL1xuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBGdW5jdGlvbik6IHZvaWQgeyB0aGlzLl9vbkNoYW5nZSA9IGZuOyB9XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIHBhcnQgb2YgYSBmb3JtLCBvZiBmaXhlZCBsZW5ndGgsIHRoYXQgY2FuIGNvbnRhaW4gb3RoZXIgY29udHJvbHMuXG4gKlxuICogQSBgQ29udHJvbEdyb3VwYCBhZ2dyZWdhdGVzIHRoZSB2YWx1ZXMgYW5kIGVycm9ycyBvZiBlYWNoIHtAbGluayBDb250cm9sfSBpbiB0aGUgZ3JvdXAuIFRodXMsIGlmXG4gKiBvbmUgb2YgdGhlIGNvbnRyb2xzIGluIGEgZ3JvdXAgaXMgaW52YWxpZCwgdGhlIGVudGlyZSBncm91cCBpcyBpbnZhbGlkLiBTaW1pbGFybHksIGlmIGEgY29udHJvbFxuICogY2hhbmdlcyBpdHMgdmFsdWUsIHRoZSBlbnRpcmUgZ3JvdXAgY2hhbmdlcyBhcyB3ZWxsLlxuICpcbiAqIGBDb250cm9sR3JvdXBgIGlzIG9uZSBvZiB0aGUgdGhyZWUgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2tzIHVzZWQgdG8gZGVmaW5lIGZvcm1zIGluIEFuZ3VsYXIsXG4gKiBhbG9uZyB3aXRoIHtAbGluayBDb250cm9sfSBhbmQge0BsaW5rIENvbnRyb2xBcnJheX0uIHtAbGluayBDb250cm9sQXJyYXl9IGNhbiBhbHNvIGNvbnRhaW4gb3RoZXJcbiAqIGNvbnRyb2xzLCBidXQgaXMgb2YgdmFyaWFibGUgbGVuZ3RoLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC8yM0RFU09wYk5uQnBCSFp0MUJSND9wPXByZXZpZXcpKVxuICovXG5leHBvcnQgY2xhc3MgQ29udHJvbEdyb3VwIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sIHtcbiAgcHJpdmF0ZSBfb3B0aW9uYWxzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn07XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRyb2xzOiB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sfSxcbiAgICAgICAgICAgICAgb3B0aW9uYWxzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSBudWxsLCB2YWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCxcbiAgICAgICAgICAgICAgYXN5bmNWYWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgIHN1cGVyKHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICAgIHRoaXMuX29wdGlvbmFscyA9IGlzUHJlc2VudChvcHRpb25hbHMpID8gb3B0aW9uYWxzIDoge307XG4gICAgdGhpcy5faW5pdE9ic2VydmFibGVzKCk7XG4gICAgdGhpcy5fc2V0UGFyZW50Rm9yQ29udHJvbHMoKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgY29udHJvbCB0byB0aGlzIGdyb3VwLlxuICAgKi9cbiAgYWRkQ29udHJvbChuYW1lOiBzdHJpbmcsIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IHZvaWQge1xuICAgIHRoaXMuY29udHJvbHNbbmFtZV0gPSBjb250cm9sO1xuICAgIGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbnRyb2wgZnJvbSB0aGlzIGdyb3VwLlxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbChuYW1lOiBzdHJpbmcpOiB2b2lkIHsgU3RyaW5nTWFwV3JhcHBlci5kZWxldGUodGhpcy5jb250cm9scywgbmFtZSk7IH1cblxuICAvKipcbiAgICogTWFyayB0aGUgbmFtZWQgY29udHJvbCBhcyBub24tb3B0aW9uYWwuXG4gICAqL1xuICBpbmNsdWRlKGNvbnRyb2xOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldCh0aGlzLl9vcHRpb25hbHMsIGNvbnRyb2xOYW1lLCB0cnVlKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrIHRoZSBuYW1lZCBjb250cm9sIGFzIG9wdGlvbmFsLlxuICAgKi9cbiAgZXhjbHVkZShjb250cm9sTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQodGhpcy5fb3B0aW9uYWxzLCBjb250cm9sTmFtZSwgZmFsc2UpO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYSBjb250cm9sIHdpdGggdGhlIGdpdmVuIG5hbWUgaW4gdGhlIGdyb3VwLlxuICAgKi9cbiAgY29udGFpbnMoY29udHJvbE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciBjID0gU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLmNvbnRyb2xzLCBjb250cm9sTmFtZSk7XG4gICAgcmV0dXJuIGMgJiYgdGhpcy5faW5jbHVkZWQoY29udHJvbE5hbWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0UGFyZW50Rm9yQ29udHJvbHMoKSB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuY29udHJvbHMsIChjb250cm9sLCBuYW1lKSA9PiB7IGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpOyB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZVZhbHVlKCkgeyB0aGlzLl92YWx1ZSA9IHRoaXMuX3JlZHVjZVZhbHVlKCk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgcmVzID0gZmFsc2U7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuY29udHJvbHMsIChjb250cm9sLCBuYW1lKSA9PiB7XG4gICAgICByZXMgPSByZXMgfHwgKHRoaXMuY29udGFpbnMobmFtZSkgJiYgY29udHJvbC5zdGF0dXMgPT0gc3RhdHVzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVkdWNlVmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZHVjZUNoaWxkcmVuKHt9LCAoYWNjLCBjb250cm9sLCBuYW1lKSA9PiB7XG4gICAgICBhY2NbbmFtZV0gPSBjb250cm9sLnZhbHVlO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZHVjZUNoaWxkcmVuKGluaXRWYWx1ZTogYW55LCBmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVzID0gaW5pdFZhbHVlO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLmNvbnRyb2xzLCAoY29udHJvbCwgbmFtZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2luY2x1ZGVkKG5hbWUpKSB7XG4gICAgICAgIHJlcyA9IGZuKHJlcywgY29udHJvbCwgbmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luY2x1ZGVkKGNvbnRyb2xOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgaXNPcHRpb25hbCA9IFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5fb3B0aW9uYWxzLCBjb250cm9sTmFtZSk7XG4gICAgcmV0dXJuICFpc09wdGlvbmFsIHx8IFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMuX29wdGlvbmFscywgY29udHJvbE5hbWUpO1xuICB9XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIHBhcnQgb2YgYSBmb3JtLCBvZiB2YXJpYWJsZSBsZW5ndGgsIHRoYXQgY2FuIGNvbnRhaW4gb3RoZXIgY29udHJvbHMuXG4gKlxuICogQSBgQ29udHJvbEFycmF5YCBhZ2dyZWdhdGVzIHRoZSB2YWx1ZXMgYW5kIGVycm9ycyBvZiBlYWNoIHtAbGluayBDb250cm9sfSBpbiB0aGUgZ3JvdXAuIFRodXMsIGlmXG4gKiBvbmUgb2YgdGhlIGNvbnRyb2xzIGluIGEgZ3JvdXAgaXMgaW52YWxpZCwgdGhlIGVudGlyZSBncm91cCBpcyBpbnZhbGlkLiBTaW1pbGFybHksIGlmIGEgY29udHJvbFxuICogY2hhbmdlcyBpdHMgdmFsdWUsIHRoZSBlbnRpcmUgZ3JvdXAgY2hhbmdlcyBhcyB3ZWxsLlxuICpcbiAqIGBDb250cm9sQXJyYXlgIGlzIG9uZSBvZiB0aGUgdGhyZWUgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2tzIHVzZWQgdG8gZGVmaW5lIGZvcm1zIGluIEFuZ3VsYXIsXG4gKiBhbG9uZyB3aXRoIHtAbGluayBDb250cm9sfSBhbmQge0BsaW5rIENvbnRyb2xHcm91cH0uIHtAbGluayBDb250cm9sR3JvdXB9IGNhbiBhbHNvIGNvbnRhaW5cbiAqIG90aGVyIGNvbnRyb2xzLCBidXQgaXMgb2YgZml4ZWQgbGVuZ3RoLlxuICpcbiAqICMjIEFkZGluZyBvciByZW1vdmluZyBjb250cm9sc1xuICpcbiAqIFRvIGNoYW5nZSB0aGUgY29udHJvbHMgaW4gdGhlIGFycmF5LCB1c2UgdGhlIGBwdXNoYCwgYGluc2VydGAsIG9yIGByZW1vdmVBdGAgbWV0aG9kc1xuICogaW4gYENvbnRyb2xBcnJheWAgaXRzZWxmLiBUaGVzZSBtZXRob2RzIGVuc3VyZSB0aGUgY29udHJvbHMgYXJlIHByb3Blcmx5IHRyYWNrZWQgaW4gdGhlXG4gKiBmb3JtJ3MgaGllcmFyY2h5LiBEbyBub3QgbW9kaWZ5IHRoZSBhcnJheSBvZiBgQWJzdHJhY3RDb250cm9sYHMgdXNlZCB0byBpbnN0YW50aWF0ZVxuICogdGhlIGBDb250cm9sQXJyYXlgIGRpcmVjdGx5LCBhcyB0aGF0IHdpbGwgcmVzdWx0IGluIHN0cmFuZ2UgYW5kIHVuZXhwZWN0ZWQgYmVoYXZpb3Igc3VjaFxuICogYXMgYnJva2VuIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzIzREVTT3BiTm5CcEJIWnQxQlI0P3A9cHJldmlldykpXG4gKi9cbmV4cG9ydCBjbGFzcyBDb250cm9sQXJyYXkgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2wge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbHM6IEFic3RyYWN0Q29udHJvbFtdLCB2YWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCxcbiAgICAgICAgICAgICAgYXN5bmNWYWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgIHN1cGVyKHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICAgIHRoaXMuX2luaXRPYnNlcnZhYmxlcygpO1xuICAgIHRoaXMuX3NldFBhcmVudEZvckNvbnRyb2xzKCk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogdHJ1ZSwgZW1pdEV2ZW50OiBmYWxzZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIEFic3RyYWN0Q29udHJvbH0gYXQgdGhlIGdpdmVuIGBpbmRleGAgaW4gdGhlIGFycmF5LlxuICAgKi9cbiAgYXQoaW5kZXg6IG51bWJlcik6IEFic3RyYWN0Q29udHJvbCB7IHJldHVybiB0aGlzLmNvbnRyb2xzW2luZGV4XTsgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcge0BsaW5rIEFic3RyYWN0Q29udHJvbH0gYXQgdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAqL1xuICBwdXNoKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IHZvaWQge1xuICAgIHRoaXMuY29udHJvbHMucHVzaChjb250cm9sKTtcbiAgICBjb250cm9sLnNldFBhcmVudCh0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcge0BsaW5rIEFic3RyYWN0Q29udHJvbH0gYXQgdGhlIGdpdmVuIGBpbmRleGAgaW4gdGhlIGFycmF5LlxuICAgKi9cbiAgaW5zZXJ0KGluZGV4OiBudW1iZXIsIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLmluc2VydCh0aGlzLmNvbnRyb2xzLCBpbmRleCwgY29udHJvbCk7XG4gICAgY29udHJvbC5zZXRQYXJlbnQodGhpcyk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBjb250cm9sIGF0IHRoZSBnaXZlbiBgaW5kZXhgIGluIHRoZSBhcnJheS5cbiAgICovXG4gIHJlbW92ZUF0KGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmVBdCh0aGlzLmNvbnRyb2xzLCBpbmRleCk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogTGVuZ3RoIG9mIHRoZSBjb250cm9sIGFycmF5LlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5jb250cm9scy5sZW5ndGg7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVWYWx1ZSgpOiB2b2lkIHsgdGhpcy5fdmFsdWUgPSB0aGlzLmNvbnRyb2xzLm1hcCgoY29udHJvbCkgPT4gY29udHJvbC52YWx1ZSk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb250cm9scy5zb21lKGMgPT4gYy5zdGF0dXMgPT0gc3RhdHVzKTtcbiAgfVxuXG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0UGFyZW50Rm9yQ29udHJvbHMoKTogdm9pZCB7XG4gICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7IGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpOyB9KTtcbiAgfVxufVxuIl19