/* */ 
'use strict';var RenderComponentType = (function () {
    function RenderComponentType(id, encapsulation, styles) {
        this.id = id;
        this.encapsulation = encapsulation;
        this.styles = styles;
    }
    return RenderComponentType;
})();
exports.RenderComponentType = RenderComponentType;
var RenderDebugInfo = (function () {
    function RenderDebugInfo(injector, component, providerTokens, locals) {
        this.injector = injector;
        this.component = component;
        this.providerTokens = providerTokens;
        this.locals = locals;
    }
    return RenderDebugInfo;
})();
exports.RenderDebugInfo = RenderDebugInfo;
var Renderer = (function () {
    function Renderer() {
    }
    return Renderer;
})();
exports.Renderer = Renderer;
/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 */
var RootRenderer = (function () {
    function RootRenderer() {
    }
    return RootRenderer;
})();
exports.RootRenderer = RootRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaS50cyJdLCJuYW1lcyI6WyJSZW5kZXJDb21wb25lbnRUeXBlIiwiUmVuZGVyQ29tcG9uZW50VHlwZS5jb25zdHJ1Y3RvciIsIlJlbmRlckRlYnVnSW5mbyIsIlJlbmRlckRlYnVnSW5mby5jb25zdHJ1Y3RvciIsIlJlbmRlcmVyIiwiUmVuZGVyZXIuY29uc3RydWN0b3IiLCJSb290UmVuZGVyZXIiLCJSb290UmVuZGVyZXIuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUdBO0lBQ0VBLDZCQUFtQkEsRUFBVUEsRUFBU0EsYUFBZ0NBLEVBQ25EQSxNQUE2QkE7UUFEN0JDLE9BQUVBLEdBQUZBLEVBQUVBLENBQVFBO1FBQVNBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFtQkE7UUFDbkRBLFdBQU1BLEdBQU5BLE1BQU1BLENBQXVCQTtJQUFHQSxDQUFDQTtJQUN0REQsMEJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUhZLDJCQUFtQixzQkFHL0IsQ0FBQTtBQUVEO0lBQ0VFLHlCQUFtQkEsUUFBa0JBLEVBQVNBLFNBQWNBLEVBQVNBLGNBQXFCQSxFQUN2RUEsTUFBd0JBO1FBRHhCQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFVQTtRQUFTQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFLQTtRQUFTQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBT0E7UUFDdkVBLFdBQU1BLEdBQU5BLE1BQU1BLENBQWtCQTtJQUFHQSxDQUFDQTtJQUNqREQsc0JBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUhZLHVCQUFlLGtCQUczQixDQUFBO0FBSUQ7SUFBQUU7SUE0Q0FDLENBQUNBO0lBQURELGVBQUNBO0FBQURBLENBQUNBLEFBNUNELElBNENDO0FBNUNxQixnQkFBUSxXQTRDN0IsQ0FBQTtBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBRUg7SUFBQUU7SUFFQUMsQ0FBQ0E7SUFBREQsbUJBQUNBO0FBQURBLENBQUNBLEFBRkQsSUFFQztBQUZxQixvQkFBWSxlQUVqQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvcic7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJDb21wb25lbnRUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbixcbiAgICAgICAgICAgICAgcHVibGljIHN0eWxlczogQXJyYXk8c3RyaW5nIHwgYW55W10+KSB7fVxufVxuXG5leHBvcnQgY2xhc3MgUmVuZGVyRGVidWdJbmZvIHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yOiBJbmplY3RvciwgcHVibGljIGNvbXBvbmVudDogYW55LCBwdWJsaWMgcHJvdmlkZXJUb2tlbnM6IGFueVtdLFxuICAgICAgICAgICAgICBwdWJsaWMgbG9jYWxzOiBNYXA8c3RyaW5nLCBhbnk+KSB7fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcmVudFJlbmRlcmVyIHsgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUpOiBSZW5kZXJlcjsgfVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVuZGVyZXIgaW1wbGVtZW50cyBQYXJlbnRSZW5kZXJlciB7XG4gIGFic3RyYWN0IHJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlKTogUmVuZGVyZXI7XG5cbiAgYWJzdHJhY3Qgc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3I6IHN0cmluZyk6IGFueTtcblxuICBhYnN0cmFjdCBjcmVhdGVFbGVtZW50KHBhcmVudEVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogYW55O1xuXG4gIGFic3RyYWN0IGNyZWF0ZVZpZXdSb290KGhvc3RFbGVtZW50OiBhbnkpOiBhbnk7XG5cbiAgYWJzdHJhY3QgY3JlYXRlVGVtcGxhdGVBbmNob3IocGFyZW50RWxlbWVudDogYW55KTogYW55O1xuXG4gIGFic3RyYWN0IGNyZWF0ZVRleHQocGFyZW50RWxlbWVudDogYW55LCB2YWx1ZTogc3RyaW5nKTogYW55O1xuXG4gIGFic3RyYWN0IHByb2plY3ROb2RlcyhwYXJlbnRFbGVtZW50OiBhbnksIG5vZGVzOiBhbnlbXSk7XG5cbiAgYWJzdHJhY3QgYXR0YWNoVmlld0FmdGVyKG5vZGU6IGFueSwgdmlld1Jvb3ROb2RlczogYW55W10pO1xuXG4gIGFic3RyYWN0IGRldGFjaFZpZXcodmlld1Jvb3ROb2RlczogYW55W10pO1xuXG4gIGFic3RyYWN0IGRlc3Ryb3lWaWV3KGhvc3RFbGVtZW50OiBhbnksIHZpZXdBbGxOb2RlczogYW55W10pO1xuXG4gIGFic3RyYWN0IGxpc3RlbihyZW5kZXJFbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRnVuY3Rpb247XG5cbiAgYWJzdHJhY3QgbGlzdGVuR2xvYmFsKHRhcmdldDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IEZ1bmN0aW9uO1xuXG4gIGFic3RyYWN0IHNldEVsZW1lbnRQcm9wZXJ0eShyZW5kZXJFbGVtZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpO1xuXG4gIGFic3RyYWN0IHNldEVsZW1lbnRBdHRyaWJ1dGUocmVuZGVyRWxlbWVudDogYW55LCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZVZhbHVlOiBzdHJpbmcpO1xuXG4gIC8qKlxuICAgKiBVc2VkIG9ubHkgaW4gZGVidWcgbW9kZSB0byBzZXJpYWxpemUgcHJvcGVydHkgY2hhbmdlcyB0byBjb21tZW50IG5vZGVzLFxuICAgKiBzdWNoIGFzIDx0ZW1wbGF0ZT4gcGxhY2Vob2xkZXJzLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0QmluZGluZ0RlYnVnSW5mbyhyZW5kZXJFbGVtZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBzdHJpbmcpO1xuXG4gIGFic3RyYWN0IHNldEVsZW1lbnREZWJ1Z0luZm8ocmVuZGVyRWxlbWVudDogYW55LCBpbmZvOiBSZW5kZXJEZWJ1Z0luZm8pO1xuXG4gIGFic3RyYWN0IHNldEVsZW1lbnRDbGFzcyhyZW5kZXJFbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nLCBpc0FkZDogYm9vbGVhbik7XG5cbiAgYWJzdHJhY3Qgc2V0RWxlbWVudFN0eWxlKHJlbmRlckVsZW1lbnQ6IGFueSwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZyk7XG5cbiAgYWJzdHJhY3QgaW52b2tlRWxlbWVudE1ldGhvZChyZW5kZXJFbGVtZW50OiBhbnksIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pO1xuXG4gIGFic3RyYWN0IHNldFRleHQocmVuZGVyTm9kZTogYW55LCB0ZXh0OiBzdHJpbmcpO1xufVxuXG4vKipcbiAqIEluamVjdGFibGUgc2VydmljZSB0aGF0IHByb3ZpZGVzIGEgbG93LWxldmVsIGludGVyZmFjZSBmb3IgbW9kaWZ5aW5nIHRoZSBVSS5cbiAqXG4gKiBVc2UgdGhpcyBzZXJ2aWNlIHRvIGJ5cGFzcyBBbmd1bGFyJ3MgdGVtcGxhdGluZyBhbmQgbWFrZSBjdXN0b20gVUkgY2hhbmdlcyB0aGF0IGNhbid0IGJlXG4gKiBleHByZXNzZWQgZGVjbGFyYXRpdmVseS4gRm9yIGV4YW1wbGUgaWYgeW91IG5lZWQgdG8gc2V0IGEgcHJvcGVydHkgb3IgYW4gYXR0cmlidXRlIHdob3NlIG5hbWUgaXNcbiAqIG5vdCBzdGF0aWNhbGx5IGtub3duLCB1c2Uge0BsaW5rICNzZXRFbGVtZW50UHJvcGVydHl9IG9yIHtAbGluayAjc2V0RWxlbWVudEF0dHJpYnV0ZX1cbiAqIHJlc3BlY3RpdmVseS5cbiAqXG4gKiBJZiB5b3UgYXJlIGltcGxlbWVudGluZyBhIGN1c3RvbSByZW5kZXJlciwgeW91IG11c3QgaW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlLlxuICpcbiAqIFRoZSBkZWZhdWx0IFJlbmRlcmVyIGltcGxlbWVudGF0aW9uIGlzIGBEb21SZW5kZXJlcmAuIEFsc28gYXZhaWxhYmxlIGlzIGBXZWJXb3JrZXJSZW5kZXJlcmAuXG4gKi9cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJvb3RSZW5kZXJlciBpbXBsZW1lbnRzIFBhcmVudFJlbmRlcmVyIHtcbiAgYWJzdHJhY3QgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUpOiBSZW5kZXJlcjtcbn1cbiJdfQ==