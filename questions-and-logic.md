| Question # | Question Text | Response Type | Required | Validation | Conditional Logic | Maps to PDF | Notes |
|------------|---------------|---------------|----------|------------|-------------------|-------------|-------|

| 1 | What is the deceased’s correct full legal name? | text | yes | non-empty | none | PR7:deceased_fullname | | 
| 2 | Does this name (the deceased’s correct full legal name) match the name as stated in the will? | radio:Yes/No | yes | none | if Yes→Q3, if No→Q2a | if No→PR7: deceased_name_discrepancy (conditional text: "named in the will as {{deceased_fullname_in_will}}") | |
| 2a | What is the deceased person's full name (as recorded on the will)? | text | yes | non-empty | none | PR7:deceased_fullname_in_will | Record exactly as appears in will |

| 3 | In what town/city did the deceased usually live at time of death? | text | yes | non-empty | none | PR7: deceased_residence | Refers to their home address where they lived, not the hospital/care facility |
| 4 | Does the will state a different town/city for the deceased’s place of residence or address? | radio:Yes/No | yes | none | if Yes→Q4a, if No→Q5 | if Yes→PR7: deceased_residence_discrepancy (conditional text: "formerly of {{former_will_address}}") | If the will does not state a residence/address, answer "No" | 
| 4a | What is the deceased’s place of residence (exactly as stated in the will)? | text | yes | non-empty | none | PR7: former_will_address | Program will need to parse, and select only town/city | 

| 5 | Please confirm the deceased’s occupation at time of death? (if retired, state “retired”) | text | yes | non-empty | none | PR7: deceased_occupation | |
| 6 | Does the will state a different occupation for the deceased? | radio: Yes/No | yes | none | if Yes→Q6a, if No→Q7 | if Yes→PR7: deceased_occupation_discrepancy (conditional text: "formerly {{former_will_occupation}}") | | 
| 6a | What is the deceased’s occupation (as recorded on the will)? | text | yes | non-empty | none | PR7: former_will_occupation | | 

| 7 | What was the place of death - please state just the town/city | text | yes | non-empty | none | PR7: placeofdeath | |
| 8 | Please confirm the date of death | date | yes | valid date, not future | none | PR7: dateofdeath | |

 
