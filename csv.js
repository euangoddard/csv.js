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
    
    /**
     * Encode ``row` to a suitable CSV string.
     * 
     * @private
     * @param {Array} row The row data to encode
     * @returns {String} The row as a CSV string
     */
    var encode_row = function (row) {
        var output_data = "";
        
        if (!_.isArray(row)) {
            throw TypeError("The row data must be an array");
        }
        
        _.each(row, function (field_data, column_index) {
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
        });
        
        return output_data;
    };
    
    
    /**
     * Decode CSV data into an array of rows each containing an array of
     * columns.
     * 
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
      * Decode CSV data into an array of rows each containing an object for each
      * column keyed using the first row as a header row
      * @param {String} raw_csv_data CSV data as a string
      * @return {Array} Rows and columns of CSV data
      */
     module.decode_to_objects = function (raw_csv_data) {
         var csv_data = module.decode(raw_csv_data);
         var header_row = csv_data[0];
         
         // Create a blank row object to be used in case there are missing data
         // points at the end of the row
         var blank_row_object = {};
         _.each(header_row, function (key) {
             blank_row_object[key] = "";
         });
         
         
         var rows_as_objects = [];
         _.each(csv_data.slice(1), function (row_as_array) {
             var row_as_object = _.extend({}, blank_row_object);
             _.each(row_as_array, function (value, index) {
                 row_as_object[header_row[index]] = value;
             });
             rows_as_objects.push(row_as_object);
         });
         
         return rows_as_objects;
     };
     
     
     /**
      * Encode CSV data in the form of an array of rows each containing an array
      * of columns into a string of CSV data
      * @param {Array} csv_data
      * @return {String} Encoded CSV data
      */
     module.encode = function (csv_data) {
         var output_string = "";
         
         if (!_.isArray(csv_data)) {
             throw TypeError("The CSV data must be an array of arrays");
         }
         
         _.each(csv_data, function (raw_row_data) {
             output_string = output_string + encode_row(raw_row_data) + "\r\n";
         });
         
         return output_string;
     };
     
     
     /**
      * Encode an array of objects to CSV data using ``headers`` to output the
      * header row and determine the order of the data from the objects.
      * 
      * If a key is not found on the object ``missing_value`` will be
      * substituted in its place.
      * 
      * @param {Array} objects_to_encode The row data as objects to encode
      * @param {Array} headers The (ordered) headers for the file
      * @param {String} missing_value The value to use when a key is not found
      * on an object (default "")
      * @returns {String} Encoded CSV data
      */
     module.encode_objects = function (objects_to_encode, headers, missing_value) {
         if (!_.isArray(headers)) {
             throw TypeError("headers must be an array");
         }
         
         var output_string = encode_row(headers) + "\r\n";
         missing_value = missing_value || "";
         _.each(objects_to_encode, function (object_to_encode) {
             var row_as_array = [];
             _.each(headers, function (object_key) {
                 if (object_key in object_to_encode) {
                     row_as_array.push(object_to_encode[object_key]);
                 } else {
                     row_as_array.push(missing_value);
                 }
             });
             output_string = output_string + encode_row(row_as_array) + "\r\n";
         });
         
         return output_string;
     };
    
})(csv);