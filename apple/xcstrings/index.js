/* URLs */
const google_translate_p1 = "https://translate.google.com/?sl="
const google_translate_p2 = "&tl="
const google_translate_p3 = "&op=translate"
const google_translate_p4 = "&text="

const line_divider = "\n\n"

/* Elements */
const language_from_select = document.getElementById("language_from_select")
const language_to_select = document.getElementById("language_to_select")
const table_element = document.getElementById("table")
const original_list_element = document.getElementById("original_list")

/* Variables */
var original_xcstrings = {}
var key_list_for_translation = []
var language_list = []
var language_translated_count_list = []
var google_translate_url = google_translate_p1 + "auto" + google_translate_p2 + "en" + google_translate_p3

function language_from_change(event) {
    if (event) {    // event == true means triggered by user
        /* Regenerate original_list_element.value */
        // Clear
        original_list_element.value = ""
        if (language_from_select.value == original_xcstrings["sourceLanguage"]) {
            for (const key of key_list_for_translation) {
                original_list_element.value += key + line_divider
            }
        } else {
            for (const key of key_list_for_translation) {
                original_list_element.value += original_xcstrings["strings"][key]["localizations"][language_from_select.value]["stringUnit"]["value"] + line_divider
            }
        }
    }
    google_translate_url = google_translate_p1
        + language_from_select.value + google_translate_p2
        + language_to_select.value + google_translate_p3
        + google_translate_p4 + encodeURIComponent(original_list_element.value)
}

function render_selection() {
    // Clear
    language_from_select.onchange = ()=>{}  // avoid triggering onchange when rendering
    language_from_select.innerHTML = ""
    language_to_select.innerHTML = ""

    // Create "sourceLanguage" option in language_from_select
    const option_element_source = document.createElement("option");
    option_element_source.setAttribute("value", original_xcstrings["sourceLanguage"])
    option_element_source.innerHTML = original_xcstrings["sourceLanguage"]
    language_from_select.appendChild(option_element_source);
    
    for (const language_index in language_list) {
        // New Option
        const language = language_list[language_index]
        const option_element = document.createElement("option");
        option_element.setAttribute("value", language)
        option_element.innerHTML = language

        // Append
        if (language_translated_count_list[language_index] == key_list_for_translation.length) {
            language_from_select.appendChild(option_element);
        } else {
            language_to_select.appendChild(option_element);
        }
    }
    language_from_select.onchange = language_from_change;
}

function render_table() {
    // Clear
    language_translated_count_list = Array(language_list.length).fill(0)
    table_element.innerHTML = ""

    // Render rows
    for (const key in original_xcstrings["strings"]) {
        const value = original_xcstrings["strings"][key];

        if (value["shouldTranslate"] !== false) {
            // Add key to row
            const row = document.createElement("tr")
            const row_header = document.createElement("td")
            row_header.innerHTML = key
            row.appendChild(row_header)

            // Add comment to row
            const comment_element = document.createElement("td")
            comment_element.innerHTML = value["comment"] ? value["comment"] : ""
            row.appendChild(comment_element)

            // Add table contents
            if (value["localizations"]) {
                for (const language_index in language_list) {
                    const table_cell = document.createElement("td")
                    const language_object = value["localizations"][language_list[language_index]]
                    if (language_object && language_object["stringUnit"]) {
                        table_cell.innerHTML = language_object["stringUnit"]["value"]
                        table_cell.className = language_object["stringUnit"]["state"]

                        // translated count
                        language_translated_count_list[language_index] += 1
                    }
                    row.appendChild(table_cell)
                }    
            }
            // Add row to table
            table_element.appendChild(row)
        }
    }

    const table_header_row = document.createElement("tr")

    // Translation Header
    const translation_header = document.createElement("th");
    translation_header.innerHTML = "key (" + original_xcstrings["sourceLanguage"] + ")"
    translation_header.style.width = "200px"
    table_header_row.appendChild(translation_header);

    const comment_header = document.createElement("th");
    comment_header.innerHTML = "Comment"
    comment_header.style.width = "100px"
    table_header_row.appendChild(comment_header);

    for (const language of language_list) {
        // New Option
        const table_header = document.createElement("th");
        table_header.innerHTML = language

        // Append
        table_header_row.appendChild(table_header);
    }
    table_element.prepend(table_header_row);
}

function output_result() {
    document.getElementById("translated_xcstrings").value = JSON.stringify(original_xcstrings, null, 4)
}

function render() {
    render_table();
    render_selection();
    language_from_change();
    output_result();
}

function load_translated_list() {
    const translated_text = document.getElementById("translated_list").value

    // Split
    const translated_text_list = translated_text.split(line_divider)
    if (translated_text_list.length === key_list_for_translation.length) {
        for (const key_index in key_list_for_translation) {
            const key = key_list_for_translation[key_index];
            const language_object = {
                "stringUnit": {
                    "state": "needs_review",
                    "value": translated_text_list[key_index]
                }
            }
            if (original_xcstrings["strings"][key]["localizations"]) {
                if (!original_xcstrings["strings"][key]["localizations"][language_to_select.value]) {   
                    original_xcstrings["strings"][key]["localizations"][language_to_select.value] = language_object
                }
            } else {
                original_xcstrings["strings"][key]["localizations"] = {}
                original_xcstrings["strings"][key]["localizations"][language_to_select.value] = language_object
            }
        }
        render();
    } else {
        alert("Length does not match!")
    }
}



document.getElementById("btn_original_xcstrings").onclick = () => {
    original_xcstrings = JSON.parse(document.getElementById("original_xcstrings").value)
    console.log(original_xcstrings);

    // Clear
    original_list_element.value = ""
    language_list = []
    key_list_for_translation = []

    for (const key in original_xcstrings["strings"]) {
        const value = original_xcstrings["strings"][key];

        if (value["shouldTranslate"] !== false) {
            original_list_element.value += key + line_divider;
            key_list_for_translation.push(key)

            // Create language
            if (value["localizations"]) {
                const new_language_list = Object.keys(value["localizations"])
                language_list = [...new Set([...language_list, ...new_language_list])];
            }
        }
    }
    render();
}

document.getElementById("btn_google_translate").onclick = () => {
    window.open(google_translate_url);
}

document.getElementById("btn_translated_list").onclick = load_translated_list;