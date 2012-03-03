#CSV parsing and encoding for Javascript#

csv.js provides a single module named `csv` which exposes two functions `encode` and `decode`. These functions take an array of arrays and turn them into a CSV string and vice-versa respectively.

##Encoding data to a CSV string##

`csv.encode` takes an array of arrays which represent the rows and columns respectively of the data to be encoded. Any new lines, commas and quotation marks will be escaped. Additionally any non-string values will be coerced to strings where possible, e.g.

```javascript
var csv_string = csv.encode([['He said, "Hello"', "a", "b"], ["c"], [1, true]]);
console.log csv_string; // '"He said, ""Hello""",a,b\r\nc\r\n1,true\r\n
```

##Decoding CSV strings to javascript arrays##

`csv.decode` takes a string and converts it into an array of arrays representing the rows and columns of the CSV file respectively, e.g.

```javascript
var csv_data = csv.decode('a,"b,c"\r\n"A ""quoted string""","new\r\nline"');
console.log(csv_data); // [["a", "b,c"], 'A "quoted string"], ["new\r\nline"]]
```

For more examples, see the unit tests.

If you find any combinations which are not correctly converted, get in touch!