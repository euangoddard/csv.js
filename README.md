#CSV parsing and encoding for Javascript#

csv.js provides a single module named `csv` which exposes two functions `encode` and `decode`. These functions take an array of arrays and turn them into a CSV string and vice-versa respectively.

##Encoding data to a CSV string##

`csv.encode` takes an array of arrays which represent the rows and columns respectively of the data to be encoded. Any new lines, commas and quotation marks will be escaped. Additionally any non-string values will be coerced to strings where possible, e.g.

```javascript
csv.encode([['He said, "Hello"', "a", "b"], ["c"], [1, true]]); // '"He said, ""Hello""",a,b\r\nc\r\n1,true\r\n
```