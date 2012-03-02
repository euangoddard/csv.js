/*******************************************************************************
 *
 * Copyright (c) 2012, Euan Goddard <euan.goddard@gmail.com>.
 * All Rights Reserved.
 *
 * This file is part of csv.js <https://github.com/euangoddard/csv.js>,
 * which is subject to the provisions of the BSD at
 * <https://github.com/euangoddard/csv.js/raw/master/LICENCE>. A copy of
 * the license should accompany this distribution. THIS SOFTWARE IS PROVIDED "AS
 * IS" AND ANY AND ALL EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED, INCLUDING,
 * BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST
 * INFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 *******************************************************************************
 */

/**
 * The module is created empty initially and then augmented below
 * 
 */
var csv = {};

/**
 * Pass the empty csv module into the wrapped function. This allows private
 * functions to be declared without polluting the module or global namespaces
 */
(function (module) {
    var FIELD_PATTERN = new RegExp(
        // Delimiters.
        "(\\,|\\r?\\n|\\r|^)" +
        
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        
        // Standard fields.
        "([^\"\\,\\r\\n]*))",
        "g"
        );
    
    var DOUBLE_QUOTE_PATTERN = new RegExp("\"\"", "g");
    
    var REQUIRES_QUOTING_PATTERN = new RegExp("\\r?\\n|\\r|,|\"");
    
    var encode_row = function(row) {
        var column_index;
        var column_count;
        var field_data;
        var output_data = "";
        
        if (!is_array(row)) {
            throw TypeError("The row data must be an array");
        }
        
        column_count = row.length;
        
        for (column_index=0; column_index<column_count; column_index += 1) {
            field_data = row[column_index];
            
            if (field_data.constructor !== String) {
                field_data = field_data.toString();
            }
            
            // Escape any quote marks
            field_data = field_data.replace(/"/g, '""');
            
            if (REQUIRES_QUOTING_PATTERN.test(field_data)) {
                // Surround the field in quotes:
                field_data = '"' + field_data + '"';
            }
            
            output_data = output_data + (column_index ? ",": "") + field_data; 
        }
        
        return output_data;
    };
    
    
    /**
     * Test whether ``test_object`` is really an Array
     * @param {Any} test_object The object being checked
     * @return {Boolean} Whether test_object is really an Array
     */
    var is_array = function (test_object) {
        return (
            typeof test_object === "object" &&
            test_object.constructor === Array
        );
    };
    
    
    /**
     * Decode CSV data into an array of rows each containing an array of columns
     * @param {String} raw_csv_data CSV data as a string
     * @return {Array} Rows and columns of CSV data
     */
    module.decode = function (raw_csv_data) {
        // The regular expressions and the method of parsing the CSV file are 
        // based on work by Ben Nadel:
        // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
        var rows = [];
        var matches = null;
        var current_row = [];
        
        if (!raw_csv_data) {
            return rows;
        }

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (matches = FIELD_PATTERN.exec(raw_csv_data)) {

            var matching_delimiter = matches[1];
            var matching_string = matches[2];
            
            // Check to see if the given delimiter has a length (is not the 
            // start of string) and if it matches field delimiter. If it does
            // not, then we know that this delimiter is a row delimiter.
            if (matching_delimiter.length && matching_delimiter !== ",") {
                // We have reached a new row of data, add this current row
                // to the array of rows and start a new row
                rows.push(current_row);
                current_row = [];
            }
            
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (matching_string) {
                // This is a quoted field: capture this value and unescape 
                // any double quotes.
                matching_string = matching_string.replace(
                    DOUBLE_QUOTE_PATTERN, "\"");
            
            } else {
                // This is an unquoted field
                matching_string = matches[3];
            }
            
            current_row.push(matching_string);
        }

        return rows;
     };
     
     
     /**
      * Encode CSV data in the form of an array of rows each containing an array of
      * columns into a string of CSV data
      * @param {Array} csv_data
      * @return {String} Encoded CSV data
      */
     module.encode = function (csv_data) {
         var row_index;
         var row_count;
         var output_string = "";
         
         if (!is_array(csv_data)) {
             throw TypeError("The CSV data must be an array of arrays");
         }
         
         row_count = csv_data.length;
         for (row_index=0; row_index<row_count; row_index += 1) {
             output_string = output_string + encode_row(csv_data[row_index]) + "\r\n";
         }
         
         return output_string;
     };
    
})(csv);