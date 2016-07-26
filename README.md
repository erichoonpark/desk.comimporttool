#Desk.com Import Tool

## Synopsis
A tool for importing companies and customers into the Desk.com platform from CSV. Agents or customers can import companies or customers simply with a click of a button. The project is built off of Node.js and Express. 

## Warnings
Please use this tool resposibly. Data migrations can be incredibly tricky. As a general rule of thumb, please review the CSV for import. 

1. All data types must align on the CSV i.e integer to integer, date to date, etc...
2. All string fields must be between quotes ("")
3. The first five headers must be name, domains, created_at, updated_at, and company_data_import_id

Please follow the formatting of this sample CSV: 
https://org62.my.salesforce.com/sfc/p/000000000062/a/0M000000HmgD/uUSQxMt_ZL2RIwtfKUqf59szjjC3ii84SQrS.PmMy60

## Installation
This project is hosted entirely online. Please go to https://still-cliffs-62925.herokuapp.com/ to start the import

## API Reference
The importTool utilizes the Salesforce Desk.com API.

## Tests

## Contributors

Eric Park 
Salesforce Solutions Consultant

## License
MIT License

Copyright (c) 2016 Eric H. Park

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
