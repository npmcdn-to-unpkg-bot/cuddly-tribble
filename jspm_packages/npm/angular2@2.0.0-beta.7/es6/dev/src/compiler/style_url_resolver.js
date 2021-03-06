/* */ 
"format cjs";
// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js
import { RegExpWrapper, StringWrapper, isPresent, isBlank } from 'angular2/src/facade/lang';
export class StyleWithImports {
    constructor(style, styleUrls) {
        this.style = style;
        this.styleUrls = styleUrls;
    }
}
export function isStyleUrlResolvable(url) {
    if (isBlank(url) || url.length === 0 || url[0] == '/')
        return false;
    var schemeMatch = RegExpWrapper.firstMatch(_urlWithSchemaRe, url);
    return isBlank(schemeMatch) || schemeMatch[1] == 'package' || schemeMatch[1] == 'asset';
}
/**
 * Rewrites stylesheets by resolving and removing the @import urls that
 * are either relative or don't have a `package:` scheme
 */
export function extractStyleUrls(resolver, baseUrl, cssText) {
    var foundUrls = [];
    var modifiedCssText = StringWrapper.replaceAllMapped(cssText, _cssImportRe, (m) => {
        var url = isPresent(m[1]) ? m[1] : m[2];
        if (!isStyleUrlResolvable(url)) {
            // Do not attempt to resolve non-package absolute URLs with URI scheme
            return m[0];
        }
        foundUrls.push(resolver.resolve(baseUrl, url));
        return '';
    });
    return new StyleWithImports(modifiedCssText, foundUrls);
}
var _cssImportRe = /@import\s+(?:url\()?\s*(?:(?:['"]([^'"]*))|([^;\)\s]*))[^;]*;?/g;
// TODO: can't use /^[^:/?#.]+:/g due to clang-format bug:
//       https://github.com/angular/angular/issues/4596
var _urlWithSchemaRe = /^([a-zA-Z\-\+\.]+):/g;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfdXJsX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3N0eWxlX3VybF9yZXNvbHZlci50cyJdLCJuYW1lcyI6WyJTdHlsZVdpdGhJbXBvcnRzIiwiU3R5bGVXaXRoSW1wb3J0cy5jb25zdHJ1Y3RvciIsImlzU3R5bGVVcmxSZXNvbHZhYmxlIiwiZXh0cmFjdFN0eWxlVXJscyJdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDO0FBQy9DLHVGQUF1RjtPQUVoRixFQUFTLGFBQWEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtBQUdqRztJQUNFQSxZQUFtQkEsS0FBYUEsRUFBU0EsU0FBbUJBO1FBQXpDQyxVQUFLQSxHQUFMQSxLQUFLQSxDQUFRQTtRQUFTQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtJQUFHQSxDQUFDQTtBQUNsRUQsQ0FBQ0E7QUFFRCxxQ0FBcUMsR0FBVztJQUM5Q0UsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsTUFBTUEsS0FBS0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDcEVBLElBQUlBLFdBQVdBLEdBQUdBLGFBQWFBLENBQUNBLFVBQVVBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDbEVBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLFNBQVNBLElBQUlBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLE9BQU9BLENBQUNBO0FBQzFGQSxDQUFDQTtBQUVEOzs7R0FHRztBQUNILGlDQUFpQyxRQUFxQixFQUFFLE9BQWUsRUFDdEMsT0FBZTtJQUM5Q0MsSUFBSUEsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDbkJBLElBQUlBLGVBQWVBLEdBQUdBLGFBQWFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsWUFBWUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLElBQUlBLEdBQUdBLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxvQkFBb0JBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9CQSxzRUFBc0VBO1lBQ3RFQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDSEEsTUFBTUEsQ0FBQ0EsSUFBSUEsZ0JBQWdCQSxDQUFDQSxlQUFlQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtBQUMxREEsQ0FBQ0E7QUFFRCxJQUFJLFlBQVksR0FBRyxpRUFBaUUsQ0FBQztBQUNyRiwwREFBMEQ7QUFDMUQsdURBQXVEO0FBQ3ZELElBQUksZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTb21lIG9mIHRoZSBjb2RlIGNvbWVzIGZyb20gV2ViQ29tcG9uZW50cy5KU1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYmNvbXBvbmVudHMvd2ViY29tcG9uZW50c2pzL2Jsb2IvbWFzdGVyL3NyYy9IVE1MSW1wb3J0cy9wYXRoLmpzXG5cbmltcG9ydCB7UmVnRXhwLCBSZWdFeHBXcmFwcGVyLCBTdHJpbmdXcmFwcGVyLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1VybFJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvdXJsX3Jlc29sdmVyJztcblxuZXhwb3J0IGNsYXNzIFN0eWxlV2l0aEltcG9ydHMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3R5bGU6IHN0cmluZywgcHVibGljIHN0eWxlVXJsczogc3RyaW5nW10pIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0eWxlVXJsUmVzb2x2YWJsZSh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoaXNCbGFuayh1cmwpIHx8IHVybC5sZW5ndGggPT09IDAgfHwgdXJsWzBdID09ICcvJykgcmV0dXJuIGZhbHNlO1xuICB2YXIgc2NoZW1lTWF0Y2ggPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goX3VybFdpdGhTY2hlbWFSZSwgdXJsKTtcbiAgcmV0dXJuIGlzQmxhbmsoc2NoZW1lTWF0Y2gpIHx8IHNjaGVtZU1hdGNoWzFdID09ICdwYWNrYWdlJyB8fCBzY2hlbWVNYXRjaFsxXSA9PSAnYXNzZXQnO1xufVxuXG4vKipcbiAqIFJld3JpdGVzIHN0eWxlc2hlZXRzIGJ5IHJlc29sdmluZyBhbmQgcmVtb3ZpbmcgdGhlIEBpbXBvcnQgdXJscyB0aGF0XG4gKiBhcmUgZWl0aGVyIHJlbGF0aXZlIG9yIGRvbid0IGhhdmUgYSBgcGFja2FnZTpgIHNjaGVtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFN0eWxlVXJscyhyZXNvbHZlcjogVXJsUmVzb2x2ZXIsIGJhc2VVcmw6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc1RleHQ6IHN0cmluZyk6IFN0eWxlV2l0aEltcG9ydHMge1xuICB2YXIgZm91bmRVcmxzID0gW107XG4gIHZhciBtb2RpZmllZENzc1RleHQgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgX2Nzc0ltcG9ydFJlLCAobSkgPT4ge1xuICAgIHZhciB1cmwgPSBpc1ByZXNlbnQobVsxXSkgPyBtWzFdIDogbVsyXTtcbiAgICBpZiAoIWlzU3R5bGVVcmxSZXNvbHZhYmxlKHVybCkpIHtcbiAgICAgIC8vIERvIG5vdCBhdHRlbXB0IHRvIHJlc29sdmUgbm9uLXBhY2thZ2UgYWJzb2x1dGUgVVJMcyB3aXRoIFVSSSBzY2hlbWVcbiAgICAgIHJldHVybiBtWzBdO1xuICAgIH1cbiAgICBmb3VuZFVybHMucHVzaChyZXNvbHZlci5yZXNvbHZlKGJhc2VVcmwsIHVybCkpO1xuICAgIHJldHVybiAnJztcbiAgfSk7XG4gIHJldHVybiBuZXcgU3R5bGVXaXRoSW1wb3J0cyhtb2RpZmllZENzc1RleHQsIGZvdW5kVXJscyk7XG59XG5cbnZhciBfY3NzSW1wb3J0UmUgPSAvQGltcG9ydFxccysoPzp1cmxcXCgpP1xccyooPzooPzpbJ1wiXShbXidcIl0qKSl8KFteO1xcKVxcc10qKSlbXjtdKjs/L2c7XG4vLyBUT0RPOiBjYW4ndCB1c2UgL15bXjovPyMuXSs6L2cgZHVlIHRvIGNsYW5nLWZvcm1hdCBidWc6XG4vLyAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy80NTk2XG52YXIgX3VybFdpdGhTY2hlbWFSZSA9IC9eKFthLXpBLVpcXC1cXCtcXC5dKyk6L2c7XG4iXX0=