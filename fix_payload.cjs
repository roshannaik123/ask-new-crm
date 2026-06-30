const fs = require('fs');
const path = 'c:/Users/naikr/OneDrive/Desktop/AGS Project/ask-new-crm/src/app/auth/Register.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix duplicate whats_app
content = content.replace('whats_app: "08012345678",\r\n    mailaddress: "Residence",', 'mailaddress: "Residence",');
content = content.replace('whats_app: "08012345678",\n    mailaddress: "Residence",', 'mailaddress: "Residence",');

// Uncomment user_pan_no
content = content.replace('// user_pan_no: "ABCDE1234F",', 'user_pan_no: "ABCDE1234F",');

const replacements = {
  'user_gender': 'appli_gender',
  'user_mobile_number': 'appli_mno',
  'user_qualification': 'f_mqualiself',
  'user_proof_identification': 'proof_iden',
  'father_name': 'f_mfname',
  'father_mobile': 'f_mfmno',
  'residential_add': 'f_mresadd',
  'residential_landmark': 'f_mresland',
  'residential_city': 'f_mrescity',
  'residential_pin': 'f_mrespin',
  'office_add': 'f_moffiadd',
  'office_landmark': 'f_moffiland',
  'office_city': 'f_mofficity',
  'office_pin': 'f_moffipin',
  'spouse_name': 'f_msname',
  'spouse_mobile': 'f_msmno',
  'spouse_dob': 'f_msdob',
  'user_resident_to_bang_since': 'f_mresibang',
  'donate_blood': 'donateblood'
};

for (const [oldKey, newKey] of Object.entries(replacements)) {
  const regex = new RegExp('\\b' + oldKey + '\\b', 'g');
  content = content.replace(regex, newKey);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Fixes applied successfully.");
