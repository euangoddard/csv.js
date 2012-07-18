#CSV parsing and encoding for Javascript

csv.js provides a single module named `csv` which handles the encoding and decoding of CSV data.

There are two modes of operation:

- Working with un-headed CSV data that are represented in Javascript as arrays.
- Working with CSV data with headers that are represented in Javascript as objects.

## Requirements

- [underscore.js](http://documentcloud.github.com/underscore/)

##Working with un-headed CSV data

The ``csv`` module exposes two functions to deal with this type of data: `encode` and `decode`. These functions take an array of arrays and turn them into a CSV string and vice-versa respectively.

###Encoding data to a CSV string

`csv.encode` takes an array of arrays which represent the rows and columns respectively of the data to be encoded. Any new lines, commas and quotation marks will be escaped. Additionally any non-string values will be coerced to strings where possible, e.g.

```javascript
var csv_string = csv.encode([['He said, "Hello"', "a", "b"], ["c"], [1, true]]);
console.log csv_string; // '"He said, ""Hello""",a,b\r\nc\r\n1,true\r\n
```

###Decoding CSV strings to javascript arrays

`csv.decode` takes a string and converts it into an array of arrays representing the rows and columns of the CSV file respectively, e.g.

```javascript
var csv_data = csv.decode('a,"b,c"\r\n"A ""quoted string""","new\r\nline"');
console.log(csv_data); // [["a", "b,c"], 'A "quoted string"], ["new\r\nline"]]
```

##Working with headed CSV data

For cases where you wish to encode an array of objects or decode a headed CSV file to an array of objects use ``encode_objects`` or ``decode_to_objects`` repectively.

###Encoding data to a CSV string

`csv.encode_objects` takes an array of objects which represent the rows and columns respectively of the data to be encoded. The objects do no need to have all the column data and can be out-of-order, e.g.

```javascript
var headers = ["Width", "Height", "Depth"];
var objects_to_encode = [
  {Width: 100},
  {Depth: 150}
];
var csv_string = csv.encode_objects(
  objects_to_encode, // The array of objects to be encoded
  headers, // The order in which the headers should appear and also the keys to look-up the values in each object
  "0" // The fallback value to use in case of a missing key on an object
);
console.log csv_string; // "Width,Height,Depth\r\n100,0,0\r\n0,0,150\r\n"
```

###Decoding CSV strings to javascript arrays of objects

When reading data which in which the first line represents the keys (headers) of objects, use `csv.decode_to_objects`. This function takes a string and converts it into an array of objects representing the rows and columns of the CSV file respectively. Any blank columns in the input string or rows which do not have sufficient columns are handled, e.g.

```javascript
var csv_data = "First name,Last name,Middle name,Username\r\nJames,Bond,,jb007\r\nErnst,Blofeld,Stavro\r\n";
console.log(csv_data); // [
  //  {"First name": "James", "Last name": "Bond", "Middle name": "", "Username": "jb007"},
  //  {"First name": "Ernst", "Last name": "Blofeld", "Middle name": "Stavro", "Username": ""}
  //];
```

For more examples, see the unit tests.

If you find any combinations which are not correctly converted, get in touch!