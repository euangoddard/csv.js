/**
 * Utility functionality to assist tests
 */

var is_array = function (test_object) {
    return typeof test_object === "object" && test_object.constructor === Array;
};

var are_rows_equal = function (found_rows, expected_rows) {
    if (!(is_array(found_rows) && is_array(expected_rows))) {
        return false;
    }
    if (found_rows.length !== expected_rows.length) {
        return false;
    }
    
    for (var row_index=0, found_row, expected_row; row_index < found_rows.length; row_index += 1) {
        found_row = found_rows[row_index];
        expected_row = expected_rows[row_index];
        
        if (!(is_array(found_row) && is_array(expected_row))) {
            return false;
        }
        if (found_row.length !== expected_row.length) {
            return false;
        }
        
        for (var col_index=0; col_index<found_row.length; col_index += 1) {
            if (found_row[col_index] !== expected_row[col_index]) {
                return false;
            }
        }
    }
    return true;
};


/**
 * Tests for the decoding function
 */

test("No quoting single row decoded", function () {
    var raw_csv_data = "a,b,c\r\n";
    var expected_result = [["a", "b", "c"]];
    
    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});

test("Quoted single row decoded", function () {
    var raw_csv_data = '"a","b","c"\r\n';
    var expected_result = [["a", "b", "c"]];
    
    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});

test("Quotation mark in column decoded", function () {
    var raw_csv_data = '"a ""quote""",b,c\r\n';
    var expected_result = [['a "quote"', "b", "c"]];
    
    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});

test("Commas inside column decoded", function () {
    var raw_csv_data = '"a,b","c,d","e,f,g"\r\n';
    var expected_result = [['a,b', 'c,d', 'e,f,g']];
    
    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});

test("Multi-line columns decoded", function () {
    var raw_csv_data = '"a\nb",c,d\r\n';
    var expected_result = [['a\nb', 'c', 'd']];
    
    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});

test("Multiple rows of the same length decoded", function () {
    var raw_csv_data = 'a\r\nb\r\nc\r\n';
    var expected_result = [['a'], ['b'], ['c']];

    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});

test("Multiple rows of the different lengths decoded", function () {
    var raw_csv_data = 'a\r\nb,c\r\nd,e,f\r\n';
    var expected_result = [['a'], ['b', 'c'], ['d', 'e', 'f']];

    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});

test("Single column, multiple rows decoded", function () {
    var raw_csv_data = 'a\r\nb\r\nc\r\n';
    var expected_result = [['a'], ['b'], ['c']];

    ok(are_rows_equal(csv.decode(raw_csv_data), expected_result));
});


/**
 * Tests for the encoding function
 */
test("Encode takes an array of arrays", function () {
    expect(3);
    raises(function () { csv.encode("a string"); }, TypeError);
    raises(function () { csv.encode(["a string"]); }, TypeError);
    ok(csv.encode([["a"]]));
});

test("A single row and column can be encoded", function () {
    var csv_data = [["a"]];
    var expected_output = "a\r\n";
    equal(csv.encode(csv_data), expected_output);
});

test("A single row of strings can be encoded", function () {
    var csv_data = [["a", "b", "c"]];
    var expected_output = "a,b,c\r\n";
    equal(csv.encode(csv_data), expected_output);
});

test("A single column of strings can be encoded", function () {
    var csv_data = [["a"], ["b"], ["c"]];
    var expected_output = "a\r\nb\r\nc\r\n";
    equal(csv.encode(csv_data), expected_output);
});

test("Multiple rows of differning lengths can be encoded", function () {
    var csv_data = [
        ["a", "b", "c"],
        ["d"],
        ["e", "f"]
    ];
    var expected_output = "a,b,c\r\nd\r\n\e,f\r\n";
    equal(csv.encode(csv_data), expected_output);
});

test("Quotes are encoded within a field", function () {
    var csv_data = [['The "correct way"', "other field"]];
    var expected_output = '"The ""correct way""",other field\r\n';
    equal(csv.encode(csv_data), expected_output);
});

test("Commas are quoted inside fields", function () {
    var csv_data = [["a, b", "c"]];
    var expected_output = '"a, b",c\r\n';
    equal(csv.encode(csv_data), expected_output);
});

test("Newlines are supported within fields", function () {
    var csv_data = [["unix\nline break", "windows\r\nline break"]];
    var expected_output = '"unix\nline break","windows\r\nline break"\r\n';
    equal(csv.encode(csv_data), expected_output);
});

test("Non-string values are coerced to strings where possible", function () {
    var csv_data = [["a", 1, ["Array data", "second item"], {'object': 'yes'}, true]];
    var expected_output = "a,1,\"Array data,second item\",[object Object],true\r\n";
    equal(csv.encode(csv_data), expected_output);
});
