// console.log("CSV to HL7");
const cr = '\n';
const pipe = '|';
const carrot = '^';

// Demo data
var csv = '34D0242966,20200515,22225,Ledner,Amari,E,19841026,SERUM\n34D0242966,20200515,01677,Huel,Haven,P,19921026,SERUM';
var csv_array = csv.split(cr);
var hl7_message = [];

function fhs() {
    var fhs_segment = [];
    fhs_segment.push('FHS');                                         
    fhs_segment.push('^~\\&#');                                         //FHS-2
    fhs_segment.push('BEJ^2.16.840.1.113883.3.5917.2^ISO');             //FHS-3  //from csv
    fhs_segment.push('BEJ Lab^2.16.840.1.113883.3.5917.2^ISO');         //FHS-4  //from csv
    fhs_segment.push('NCDPH NCEDSS^2.16.840.1.113883.3.591.3.1^ISO');   //FHS-5
    fhs_segment.push('NCDPH EDS^2.16.840.1.113883.3.591.1.1^ISO');      //FHS-6
    fhs_segment.push('202004230100');                                   //FHS-7  //from csv
    fhs_segment.push('');                                               //FHS-8
    fhs_segment.push('202004230100');                                   //FHS-9  //from csv
    fhs_segment.push('105746688');                                      //FHS-10  //dynamic clia + date ?
    build_hl7(fhs_segment);
}
function bhs() {
    var bhs_segment = [];
    bhs_segment.push('BHS');                                          
    bhs_segment.push('^~\\&#');                                         // BHS-2
    bhs_segment.push('BEJ^2.16.840.1.113883.3.5917.2^ISO');             // BHS-3 //from csv
    bhs_segment.push('NCDPH NCEDSS^2.16.840.1.113883.3.591.3.1^ISO');   // BHS-4
    bhs_segment.push('202004230100');                                   // BHS-5 //from csv
    bhs_segment.push('202004230100');                                   // BHS-6 //from csv
    bhs_segment.push('105746688');                                      // BHS-7 //dynamic clia + date?
    build_hl7(bhs_segment);
}

function bts(total_messages) {
    var bts_segment = [];
    bts_segment.push('BTS');
    bts_segment.push(total_messages);                                   //BTS-1
    // console.log(bts_segment);
    build_hl7(bts_segment);
}

function fts() {
    var fts_segment = [];
    fts_segment.push('FTS');                                       
    fts_segment.push('1');                                              //FTS-1
    build_hl7(fts_segment);
}

function msh(fields) {
    msh_segment.push('MSH');
    msh_segment.push('^~&\\#');               // MSH-2
    msh_segment.push(fields[0]);              // MSH-3
    msh_segment.push(fields[1]);              // MSH-4

    build_hl7(msh_segment);
}

function pid(fields) {
    pid_5 = []
    
    pid_segment.push('PID');
    pid_segment.push('1');                    // PID-1
    pid_segment.push('');                     // PID-2
    pid_segment.push(fields[0] + '^^^^MR');   // PID-3
    pid_segment.push('');                     // PID-4
    pid_5.push(fields[1]);                    // PID-5.1
    pid_5.push(fields[2]);                    // PID-5.2
    pid_5.push(fields[3]);                    // PID-5.3
    pid_segment.push(pid_5.join(carrot));     // PID-5
    // another option to join the sub-fields
    pid_segment.push(`${fields[1]}^${fields[2]}^${fields[3]}`) //PID-5
    build_hl7(pid_segment);
}

function build_hl7(segment) {
    hl7_message.push(segment.join(pipe));
    // console.log(hl7_message);
}

//FHS and BHS segments
fhs();
bhs();

// Build batch body.
for (const elr_record in csv_array) {
    // console.log(csv_array[elr_record]);
    // Split each csv row into an array
    var elr = csv_array[elr_record].split(',');

    // HL7 data
    var msh_segment = [];
    var msh_fields = [];
    var pid_segment = [];
    var pid_fields = [];

    // Get the segment values based on the sequential position
    for (const item in elr) {
        // MSH 0,1
        if (parseInt(item) <= 1) {
            // console.log(`MSH: ${elr[item]}`)
            msh_fields.push(elr[item]);
        }
        // PID 2,5
        else if (parseInt(item) >= 2 && parseInt(item) <= 5) {
            pid_fields.push(elr[item]);
        }
    }

    msh(msh_fields);
    pid(pid_fields);
}

//BTS and FTS segments
bts(csv_array.length);
fts();

//Join all the segments
hl7 = hl7_message.join(cr);

//Print HL7 message to the console
console.log(hl7);