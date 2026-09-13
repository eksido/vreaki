import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createEnquiry} from '../public/enquiry.js';
const fields={name:' Ada Müller ',email:'ada@example.com',brand:'A&B',package:'Campaign Content Set',message:'Please create a summer campaign & product launch.'};
test('enquiry encodes special characters and preserves selected package',()=>{
  const draft=createEnquiry('hello@vreaki.com','Vreaki enquiry',fields,'en');
  const url=new URL(draft.href);
  assert.equal(url.pathname,'hello@vreaki.com');
  assert.equal(url.searchParams.get('subject'),'Vreaki enquiry — Campaign Content Set');
  assert.equal(url.searchParams.get('body'),draft.body);
  assert(draft.body.includes('Name: Ada Müller'));
  assert(draft.body.includes('Brand / website: A&B'));
  assert(draft.body.includes(fields.message));
});
test('German draft localizes labels and accepts general enquiries',()=>{
  const draft=createEnquiry('hello@vreaki.com','Vreaki Anfrage',{...fields,package:''},'de');
  assert(draft.body.includes('Interesse: —'));
  assert(draft.body.includes('E-Mail: ada@example.com'));
  assert(draft.subject.endsWith('A&B'));
});
test('invalid or oversized input cannot produce a draft',()=>{
  for(const patch of [{name:' '},{email:'bad-address'},{message:'short'},{message:'x'.repeat(1201)}]){
    assert.throws(()=>createEnquiry('hello@vreaki.com','Vreaki enquiry',{...fields,...patch},'en'));
  }
});
