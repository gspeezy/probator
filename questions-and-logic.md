| Question # | Question Text | Response Type | Required | Validation | Conditional Logic | Maps to PDF | Notes |
|------------|---------------|---------------|----------|------------|-------------------|-------------|-------|

| 1 | What is the deceased person's full name (as recorded on the will)? | text | yes | non-empty | none | PR7:deceased_fullname | Record exactly as appears in will |
| 2 | Is this name as stated in the will, the deceased’s correct full legal name? | radio:Yes/No | yes | none | if Yes→Q3, if No→Q2a | PR7: deceased_name_discrepancy (conditional text: "named in the will as {{deceased_fullname_in_will}}") | |
| 2a | What is the deceased’s correct full legal name? | text | yes | non-empty | none | PR7:deceased_fullname_in_will | | 

| 3 | Does the will state the deceased’s place of residence or address etc? | radio:Yes/No | yes | none | if Yes→Q3a, if No→Q4 | none | | 
| 3a | What is the deceased’s place of residence (exactly as stated in the will)? | text | yes | non-empty | none | See below ('Maps to PDF response for Q3b) | Program will need to parse, and select only town/city | 
| 3b | Did the deceased live in the same place at the time of death? | radio:Yes/No | yes | none | if Yes→Q5, if No→Q4 | if Yes→map Q3a response to PR7: deceasedresidence_town/city, if No→map response to PR7: former_will_address (conditional text: ", formerly of {{former_will_address}})
| 4 | In what village/town/city did the deceased usually live at time of death? | text | yes | non-empty | none | PR7: deceasedresidence_town/city | |

| 5 | Does the will state the deceased’s occupation? | radio:Yes/No | yes | none | if Yes→Q5a, if No→Q6 | none | | 
| 5a | What occupation is stated in the will)? | text | yes | non-empty | none | See below ('Maps to PDF response for Q5b) | | 
| 5b | Was the deceased’s occupation the same at time of death? | radio:Yes/No | yes | none | if Yes→Q7, if No→Q6 | if Yes→map Q5a response to PR7: deceased_occupation, if No→map response to PR7: former_will_occupation (conditional text: ", formerly {{former_will_occupation}})
| 6 | Please confirm the deceased’s occupation at time of death? (if retired, state “retired”) | text | yes | non-empty | none | PR7: deceased_occupation | |

| 7 | What was the place of death - please state just the village/town/city | text | yes | none | none | PR7: placeofdeath_town/city | |
| 8 | Please confirm the date of death | date | yes | valid date, not future | none | PR7: dateofdeath | |

 
