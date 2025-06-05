| Question # | Question Text | Response Type | Required | Validation | Conditional Logic | Maps to PDF | Notes |
|------------|---------------|---------------|----------|------------|-------------------|-------------|-------|

| 1 | What is the deceased’s correct full legal name? | text | yes | non-empty | none | PR7:deceased_fullname | | 
| 2 | Does this name (the deceased’s correct full legal name) exactly match the name as stated in the will? | radio:Yes/No | yes | none | if Yes→skip to Q3, if No→Q2a | if No→PR7: deceased_name_discrepancy (insert conditional text: "named in the will as {{deceased_fullname_in_will}}") | |
| 2a | What is the deceased person's full name (as recorded on the will)? | text | yes | non-empty | none | PR7:deceased_fullname_in_will | Record exactly as appears in will |

| 3 | In what town/city did the deceased usually live at the time of death? | text | yes | non-empty | none | PR7: deceased_residence | |
| 4 | Does the will state a different town/city for the deceased’s place of residence or address? | radio:Yes/No | yes | none | if Yes→Q4a, if No→skip to Q5 | if Yes→PR7: deceased_residence_discrepancy (insert conditional text: "formerly of {{former_will_address}}") | If the will does not state a residence/address, answer "No". If the street address is different but the town/city is still the same, answer "No" | 
| 4a | What is the deceased’s place of residence (exactly as stated in the will)? | text | yes | non-empty | none | PR7: former_will_address | | 

| 5 | Please confirm the deceased’s occupation at time of death? (if retired, state “retired”) | text | yes | non-empty | none | PR7: deceased_occupation | |
| 6 | Does the will state a different occupation for the deceased? | radio: Yes/No | yes | none | if Yes→Q6a, if No→skip to Q7 | if Yes→PR7: deceased_occupation_discrepancy (insert conditional text: "formerly {{former_will_occupation}}") | If the will does not state an occupation, answer "No" | 
| 6a | What is the deceased’s occupation as recorded on the will? | text | yes | non-empty | none | PR7: former_will_occupation | | 

| 7 | What was the place of death - please state just the town/city | text | yes | non-empty | none | PR7: placeofdeath | |
| 8 | Please confirm the date of death | date | yes | not a future date | none | PR7: dateofdeath | |

| 9 | How many executors are named in the will? | number | yes | positive integer | if=1→skip to Q10, if 1<→Q9a. If=1→remove all text stating "first-named" from questions 10-15a. | PR7: single/plural_administrators (if=1→"administrator", if 1<→"administrators"). PR7: single/plural_executors (if=1→"executor", if 1<→"executors" | | 
| 9a | Are all the named executors willing and able to act? | radio: Yes/No | yes | If No→display error message: "This complicates your application and means this service may not be appropriate for you. We advise you speak to a lawyer regarding this probate application." | none | | 

| 10 | What is the first-named executor's correct full legal name? | text | yes | non-empty | none | PR7:executor1_fullname | Please provide the details for the executors (if more than one named in the will) in the SAME ORDER as they appear in the will | 
| 11 | Does this name (the first-named executor’s correct full legal name) exactly match the name as stated in the will? | radio:Yes/No | yes | none | if Yes→Q12, if No→Q11a | if No→PR7: executor1_name_discrepancy (conditional text: "named in the will as {{executor_fullname_in_will}}") | |
| 11a | What is the first-named executor's full name (as recorded on the will)? | text | yes | non-empty | none | PR7:executor1_fullname_in_will | Record exactly as appears in will |

| 12 | In what town/city does the first-named executor live? | text | yes | non-empty | none | PR7: executor1_residence | |
| 13 | Does the will state a different town/city for the first-named executor's address? | radio:Yes/No | yes | none | if Yes→Q13a, if No→skip to Q14 | if Yes→PR7: executor1_residence_discrepancy (insert conditional text: "formerly of {{executor1_former_address}}") | If the will does not state a residence/address, answer "No". If the street address is different but the town/city is still the same, answer "No"  | 
| 13a | What is the first-named executor’s place of residence (exactly as stated in the will)? | text | yes | non-empty | none | PR7: executor1_former_address | | 

| 14 | What is the first-named executor’s occupation? | text | yes | non-empty | none | PR7: executor1_occupation | |
| 15 | Does the will state a different occupation for the first-named executor? | radio: Yes/No | yes | none | if Yes→Q15a, if No→skip to Q16 | if Yes→PR7: executor1_occupation_discrepancy (insert conditional text: "formerly {{executor1_former_occupation}}") | If the will does not state an occupation, answer "No" | 
| 15a | What is the first-named executor's occupation as recorded on the will? | text | yes | non-empty | none | PR7: executor1_former_occupation | | 