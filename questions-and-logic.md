| Question # | Question Text | Response Type | Required | Validation | Conditional Logic | Maps to PDF |Notes |
|------------|---------------|---------------|----------|------------|-------------------|-------------|-------|

| 1 | What is the deceased person's full name (as recorded on the will)? | text | yes | non-empty | none | PR7:deceased_fullname |Record exactly as appears in will |
| 2 | Is this name as stated in the will, the deceased’s correct full legal name? | radio:Yes/No | yes | none | if Yes→Q3, if No→Q2a | PR7: deceased_name_discrepancy (conditional text: "named in the will as {{deceased_name_in_will}}") | |
| 2a | What is the deceased’s correct full legal name? | text | yes | non-empty | none | PR7:deceased_fullname_in_will | | 

| 3 | Does the will state the deceased’s place of residence or address etc? | radio:Yes/No | yes | none | if Yes→Q3a, if No→Q4| none | | 
| 3a | What is the deceased’s place of residence (exactly as stated in the will)? | text | yes | none | none| none | | 
| 4 | In what village/town/city did the deceased usually live at time of death? | text | yes | non-empty | none | PR7: deceasedresidence_town/city| |


| 2 | Date of death | date | yes | valid date, not future | none | form1:death_date, form3:death_date | |
| 3 | Did the deceased leave a will? | radio:Yes/No | yes | none | if Yes→Q4, if No→Q8 | form1:will_exists | |
| 4 | Where is the original will located? | text | yes | non-empty | only if Q3=Yes | form1:will_location | |