import { useState } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";



//the info button next to the title of the items pages, and the help window it opens
//the text lives in content() below: one English and one Greek version, same sections in the same order


const LANGUAGE_KEY = "mc_help_language";

const NAVY = "#080125";


//the same colours the Staff Count chip uses in ItemTable
const LEGEND_CHIPS = {
    notCounted: { label: "Not Counted", variant: "outlined" },
    green: { label: "10", style: { backgroundColor: "rgb(46,125,50)", color: "#ffffff" } },
    red: { label: "4", style: { backgroundColor: "rgb(211,47,47)", color: "#ffffff" } },
    paleRed: { label: "9", style: { backgroundColor: "rgb(244,206,206)", color: "#000000" } },
    yellow: { label: "12", style: { backgroundColor: "rgb(255,202,40)", color: "#000000" } }
};


function content(language, department, quickCountAddress, hasQuickCountButton) {

    if (language === "el") {
        return {
            buttonTooltip: "Πώς λειτουργεί η σελίδα",
            title: "Πώς λειτουργεί η σελίδα",
            hint: "Πατήστε μια ενότητα για να ανοίξει.",
            sections: [
                {
                    id: "overview",
                    title: "Τι δείχνει η σελίδα",
                    blocks: [
                        `Εδώ βλέπετε όλα τα είδη του τμήματος ${department} για τα ξενοδοχεία στα οποία έχετε πρόσβαση. Όλοι οι αριθμοί μετράνε μόνο τα δικά σας ξενοδοχεία (ή, αν χρησιμοποιήσετε το φίλτρο **Hotel**, μόνο όσα έχετε επιλέξει).`,
                        "Το απόθεμα βρίσκεται πάντα σε τοποθεσίες (Bar, Store, Restaurant…). Κάθε ξενοδοχείο έχει και την τοποθεσία **Unassigned**: απόθεμα που υπάρχει στο σύστημα αλλά δεν έχει μπει ακόμα σε πραγματική τοποθεσία.",
                        "Περάστε το ποντίκι πάνω από στοιχεία του πίνακα (π.χ. τον αριθμό στο Staff Count ή τα κουμπιά) για περισσότερες λεπτομέρειες."
                    ]
                },
                {
                    id: "columns",
                    title: "Οι στήλες του πίνακα",
                    blocks: [
                        {
                            terms: [
                                ["ID", "Ο αριθμός του είδους στο σύστημα."],
                                ["Image", "Η φωτογραφία του είδους. Το γκρι εικονίδιο σημαίνει ότι δεν υπάρχει φωτογραφία (προστίθεται με το μολύβι)."],
                                ["Name, Category, Subcategory", "Τι είναι το είδος. Η παύλα (-) σημαίνει ότι δεν έχει υποκατηγορία."],
                                ["Expected Total", "Πόσα πρέπει να έχουμε: αρχική ποσότητα + αγορές + ό,τι ήρθε από άλλα ξενοδοχεία − ό,τι έφυγε προς άλλα ξενοδοχεία. Οι μετακινήσεις μέσα στο ίδιο ξενοδοχείο δεν το αλλάζουν."],
                                ["Assigned Quantity", "Πόσα βρίσκονται αυτή τη στιγμή σε πραγματικές τοποθεσίες: το άθροισμα όλων των τοποθεσιών, εκτός από το Unassigned."],
                                ["Staff Count", "Τι μέτρησε το προσωπικό με το Quick Count. Δείτε την ενότητα «Το Staff Count»."],
                                ["Missing", "Assigned Quantity − Staff Count, μόνο για τις τοποθεσίες που μετρήθηκαν (και που φαίνονται με τα φίλτρα). Πάνω από 0: το προσωπικό βρήκε λιγότερα από όσα έχει το σύστημα. Κάτω από 0: βρήκε περισσότερα. 0: όλα συμφωνούν. «-»: δεν έχει μετρηθεί ακόμα καμία τοποθεσία."],
                                ["Locations", "Πού έχει απόθεμα το είδος αυτή τη στιγμή (μόνο τοποθεσίες με ποσότητα πάνω από 0), μαζί με το ξενοδοχείο. Με πράσινο είναι οι τοποθεσίες που έχετε επιλέξει στο φίλτρο Location."],
                                ["Τελευταία στήλη", "Τα κουμπιά: επεξεργασία (μολύβι), μετακίνηση (⇄), ιστορικό (ρολόι) και, μόνο για admin, διαγραφή. Εξηγούνται παρακάτω."]
                            ]
                        },
                        "Πατήστε τον τίτλο μιας στήλης για ταξινόμηση· πατήστε ξανά για αντίστροφη σειρά. Ταξινόμηση γίνεται στις ID, Name, Category, Subcategory, Expected Total, Assigned Quantity, Staff Count και Missing. Η ταξινόμηση χρησιμοποιεί τους αριθμούς που βλέπετε, μαζί με το φίλτρο τοποθεσίας. Είδη χωρίς αριθμό («-» ή Not Counted) μπαίνουν πάντα στο τέλος."
                    ]
                },
                {
                    id: "staffCount",
                    title: "Το Staff Count",
                    blocks: [
                        "Το Staff Count αθροίζει τις μετρήσεις όλων των τοποθεσιών του είδους που έχουν μετρηθεί και τις συγκρίνει με όσα λέει το σύστημα για τις ίδιες τοποθεσίες.",
                        {
                            legend: {
                                notCounted: "Καμία τοποθεσία του είδους δεν έχει μετρηθεί ακόμα.",
                                green: "Η μέτρηση συμφωνεί με το σύστημα.",
                                red: "Μετρήθηκαν λιγότερα από όσα έχει το σύστημα. Όσο πιο έντονο το κόκκινο, τόσο μεγαλύτερη η έλλειψη· απαλό κόκκινο σημαίνει μικρή διαφορά.",
                                yellow: "Μετρήθηκαν περισσότερα από όσα έχει το σύστημα.",
                                moved: "Το σύνολο συμφωνεί, αλλά κάποιες τοποθεσίες έχουν περισσότερα και άλλες λιγότερα. Συνήθως σημαίνει ότι τεμάχια μετακινήθηκαν χωρίς να καταγραφεί μετακίνηση.",
                                partial: "Τουλάχιστον μία τοποθεσία με απόθεμα δεν έχει μετρηθεί ακόμα. Το χρώμα συγκρίνει μόνο τις τοποθεσίες που μετρήθηκαν."
                            }
                        },
                        {
                            list: [
                                "Περάστε το ποντίκι πάνω από τον αριθμό για να δείτε κάθε τοποθεσία χωριστά, π.χ. «Bar (Marbella): counted 12, assigned 10 (+2), by maria, 12/08/2026 14:32». Το counted είναι όσα μετρήθηκαν, το assigned όσα έχει το σύστημα και στην παρένθεση η διαφορά. Οι τοποθεσίες με απόθεμα που δεν μετρήθηκαν φαίνονται ως «not counted, assigned 5».",
                                  "Το Staff Count ακολουθεί το φίλτρο Location, όπως και το Assigned Quantity: με επιλεγμένες τοποθεσίες (και Only at checked locations) αθροίζει και συγκρίνει μόνο αυτές, και μόνο αυτές φαίνονται όταν περάσετε το ποντίκι. Χωρίς φίλτρο τοποθεσίας, ή με Hotel-wide total, κοιτάει όλες τις τοποθεσίες.",
                                "Το Unassigned δεν μετριέται ποτέ.",
                                "Οι μετρήσεις μένουν μέχρι να μηδενιστούν. Δεν σβήνονται όταν μετακινείται απόθεμα: αν φύγει όλο το απόθεμα από μια τοποθεσία που είχε μετρηθεί, η μέτρησή της μένει και το χρώμα μπορεί να γίνει κίτρινο. Είναι αναμενόμενο· η μέτρηση μπορεί να μηδενιστεί αν δεν χρειάζεται πια."
                            ]
                        }
                    ]
                },
                {
                    id: "search",
                    title: "Αναζήτηση, φίλτρα και εμφάνιση",
                    blocks: [
                        {
                            terms: [
                                ["Αναζήτηση", "Γράψτε στο πεδίο αναζήτησης. Με το **Search In** επιλέγετε πού θα ψάξει: All Fields (όνομα, κατηγορία και προμηθευτής), Name, Category ή Supplier."],
                                ["Filters", "Ανοίγει τα φίλτρα: Category, Subcategory, Location, Supplier και Hotel. Μέσα στην ίδια ομάδα αρκεί να ταιριάζει ένα από τα επιλεγμένα· ανάμεσα σε διαφορετικές ομάδες πρέπει να ταιριάζουν όλες. Το **Clear all filters** τα καθαρίζει όλα."],
                                ["Φίλτρο Location", "Δείχνει τα είδη που έχουν απόθεμα σε κάποια από τις επιλεγμένες τοποθεσίες και τις χρωματίζει πράσινες στον πίνακα. Ένα όνομα όπως «Store» σημαίνει το Store όλων των ξενοδοχείων που βλέπετε· για ένα μόνο ξενοδοχείο, επιλέξτε το και στο φίλτρο Hotel."],
                                ["Φίλτρο Hotel", "Μόνο για χρήστες με περισσότερα από ένα ξενοδοχεία. Τα Expected Total, Assigned Quantity και Missing υπολογίζονται ξανά μόνο για τα επιλεγμένα ξενοδοχεία."],
                                ["Διακόπτης Quantity columns", "Στο κάτω μέρος των φίλτρων. **Only at checked locations** (προεπιλογή): όταν έχετε επιλέξει τοποθεσίες, το Assigned Quantity και το Staff Count δείχνουν μόνο αυτές τις τοποθεσίες, και η ταξινόμηση και το .XLSX χρησιμοποιούν τους ίδιους αριθμούς. **Hotel-wide total**: δείχνουν πάντα όλες τις τοποθεσίες. Το Missing ακολουθεί τις ίδιες τοποθεσίες. Το Expected Total είναι πάντα συνολικό."],
                                ["Small / Medium / Large", "Μικραίνει ή μεγαλώνει τον πίνακα. Ο browser θυμάται την επιλογή σας."],
                                ["Rows per page", "Στο κάτω μέρος: 25, 50, 100 ή All (όλα)."],
                                [".XLSX", "Κατεβάζει αρχείο Excel με όλα τα είδη που ταιριάζουν στην αναζήτηση και στα φίλτρα (όλες τις σελίδες, με την τρέχουσα ταξινόμηση). Έχει τις ίδιες στήλες και τους ίδιους αριθμούς με τον πίνακα, μαζί με το φίλτρο τοποθεσίας: ID, Name, Category, Subcategory, Expected Total, Assigned Quantity, Staff Count, Missing, Locations."],
                                ...(hasQuickCountButton
                                    ? [["Κουμπί κινητού", "Ανοίγει το Quick Count σε νέα καρτέλα."]]
                                    : [])
                            ]
                        }
                    ]
                },
                {
                    id: "items",
                    title: "Προσθήκη και επεξεργασία ειδών",
                    blocks: [
                        "Το **Add Item** ανοίγει μια κενή φόρμα. Υποχρεωτικά είναι μόνο τα **Item Name** και **Category**.",
                        {
                            terms: [
                                ["Item Name", "Πρέπει να είναι μοναδικό. Αν υπάρχει ήδη, θα δείτε «An item with this name already exists»."],
                                ["Subcategory (optional)", "Επιλέξτε πρώτα Category· η λίστα δείχνει μόνο τις υποκατηγορίες της. **None** σημαίνει χωρίς υποκατηγορία."],
                                ["Supplier", "Από πού το αγοράζουμε συνήθως."],
                                ["Hotels", "Τα ξενοδοχεία που χρησιμοποιούν το είδος· τουλάχιστον ένα. Μπορείτε να προσθέσετε ή να αφαιρέσετε μόνο τα δικά σας ξενοδοχεία (εκτός αν έχετε πρόσβαση σε όλα). Απόθεμα παραλαμβάνεται ή μετακινείται μόνο σε ξενοδοχείο που υπάρχει σε αυτή τη λίστα."],
                                ["Cost per unit", "Τιμή ανά τεμάχιο."],
                                ["Opening Quantity - (ξενοδοχείο)", "Μόνο για admin, ένα πεδίο ανά ξενοδοχείο. Η αρχική ποσότητα πάνω στην οποία χτίζεται το Expected Total. Αλλάζει μόνο μετά από πλήρη φυσική καταμέτρηση. Δεν τοποθετεί απόθεμα σε καμία τοποθεσία."],
                                ["Choose Image", "Προσθέτει ή αλλάζει τη φωτογραφία. Το μικρό x δίπλα την αφαιρεί."]
                            ]
                        },
                        "Το **μολύβι** ανοίγει την ίδια φόρμα για υπάρχον είδος.",
                        {
                            list: [
                                "Αν το είδος είναι κοινό με ξενοδοχείο που δεν είναι δικό σας, τα στοιχεία του τα αλλάζει μόνο admin. Μπορείτε όμως να προσθέσετε ή να αφαιρέσετε τα δικά σας ξενοδοχεία.",
                                "Ένα ξενοδοχείο δεν αφαιρείται από το είδος όσο έχει ακόμα απόθεμα από αυτό. Μετακινήστε πρώτα το απόθεμα."
                            ]
                        }
                    ]
                },
                {
                    id: "move",
                    title: "Μετακίνηση αποθέματος (⇄)",
                    blocks: [
                        "Το κουμπί ⇄ μετακινεί τεμάχια του είδους από μια τοποθεσία σε άλλη. Εμφανίζεται μόνο σε όσους έχουν πρόσβαση **Movements**.",
                        {
                            terms: [
                                ["From", "Μόνο τοποθεσίες με απόθεμα, με το πόσα είναι διαθέσιμα."],
                                ["To", "Η τοποθεσία όπου πηγαίνουν τα τεμάχια."],
                                ["Quantity", "Πόσα. Όχι περισσότερα από τα διαθέσιμα."],
                                ["Reason (optional)", "Σύντομη σημείωση, π.χ. «για event»."]
                            ]
                        },
                        {
                            list: [
                                "Το είδος πρέπει να ανήκει στο ξενοδοχείο προορισμού. Αν όχι, θα δείτε «This item isn't part of … yet»: προσθέστε πρώτα το ξενοδοχείο στο είδος με το μολύβι.",
                                "Οι χρήστες ξενοδοχείων μετακινούν μόνο ανάμεσα σε τοποθεσίες των δικών τους ξενοδοχείων.",
                                "Μετακίνηση από το Unassigned σε πραγματική τοποθεσία ανεβάζει το Assigned Quantity.",
                                "Μετακίνηση σε άλλο ξενοδοχείο μειώνει το Expected Total του ενός ξενοδοχείου και αυξάνει του άλλου.",
                                "Αν το είδος δεν έχει απόθεμα πουθενά, δεν μετακινείται. Το απόθεμα μπαίνει πρώτα σε τοποθεσία με αγορά (παραλαβή σε τοποθεσία από τη σελίδα Purchases).",
                                "Κάθε μετακίνηση καταγράφεται και φαίνεται στο ιστορικό του είδους → Movements."
                            ]
                        }
                    ]
                },
                {
                    id: "history",
                    title: "Ιστορικό",
                    blocks: [
                        "Το κουμπί με το ρολόι δείχνει το ιστορικό του είδους: **Purchases** (χρειάζεται πρόσβαση Purchases) και **Movements** (χρειάζεται πρόσβαση Movements). Βλέπετε μόνο όσα έχετε πρόσβαση."
                    ]
                },
                {
                    id: "delete",
                    title: "Διαγραφή είδους (μόνο admin)",
                    blocks: [
                        {
                            list: [
                                "Το μαύρο κουμπί με τον κόκκινο κάδο εμφανίζεται μόνο σε admin.",
                                "Το **Delete** δουλεύει μόνο όταν το απόθεμα του είδους είναι μόνο στο Unassigned και δεν έχει ιστορικό αγορών ή μετακινήσεων.",
                                "Το **Delete with history** σβήνει το είδος μαζί με όλες τις αγορές και μετακινήσεις του, σαν να μην υπήρξε ποτέ. Πρέπει πρώτα να γράψετε ακριβώς το όνομα του είδους. Δεν αναιρείται: μόνο για δοκιμαστικά είδη ή λάθη."
                            ]
                        }
                    ]
                },
                {
                    id: "quickCount",
                    title: "Quick Count (κινητό / PDA)",
                    blocks: [
                        `Το Quick Count είναι η οθόνη καταμέτρησης για κινητά και PDA. Ανοίγει στη διεύθυνση **${quickCountAddress}**.`,
                        {
                            steps: [
                                "Συνδεθείτε με το δικό σας όνομα χρήστη και κωδικό.",
                                "**Which hotel are you counting?** Επιλέξτε ξενοδοχείο. Βλέπετε μόνο τα δικά σας.",
                                "**Where are you working right now?** Επιλέξτε την τοποθεσία όπου βρίσκεστε.",
                                "Η λίστα δείχνει όλα τα είδη με απόθεμα σε αυτή την τοποθεσία, αλφαβητικά, με φωτογραφία. Η αναζήτηση βοηθά να βρείτε γρήγορα ένα είδος. Το πράσινο **Counted: N** σημαίνει ότι έχει ήδη μετρηθεί.",
                                "Πατήστε ένα είδος. Πατήστε τη φωτογραφία για να μεγαλώσει. Μετρήστε όλα τα τεμάχια του είδους σε αυτή την τοποθεσία και βάλτε τον αριθμό με τα − / + ή πατώντας πάνω του και πληκτρολογώντας.",
                                "Πατήστε **Save count**. Επιστρέφετε στη λίστα και το είδος εμφανίζεται ως μετρημένο."
                            ]
                        },
                        {
                            list: [
                                "Νέα αποθήκευση αντικαθιστά την προηγούμενη μέτρηση, δεν προστίθεται σε αυτή. Η οθόνη δείχνει ποιος μέτρησε τελευταίος και πότε.",
                                "Το **Actually, not counted yet** σβήνει τη μέτρηση του είδους σε αυτή την τοποθεσία (π.χ. μετά από λάθος). Το προσωπικό καταμέτρησης μπορεί να σβήσει μόνο δικές του μετρήσεις.",
                                "Είδος που βρίσκεται στην τοποθεσία αλλά δεν είναι στη λίστα δεν είναι καταχωρημένο εκεί στο σύστημα. Μην το προσπεράσετε: ενημερώστε έναν manager να το μετακινήσει εκεί με το ⇄, ώστε να εμφανιστεί.",
                                "Βλέπετε μόνο τα είδη του δικού σας τμήματος (ο admin βλέπει όλα).",
                                "Μετά από 60 λεπτά χωρίς αποθήκευση γίνεται αυτόματη αποσύνδεση. Κάθε αποθήκευση ή αναίρεση δίνει άλλα 60 λεπτά. Στα κοινόχρηστα PDA πατάτε πάντα **Log out** (πάνω δεξιά, στην οθόνη ξενοδοχείου/τοποθεσίας) όταν τελειώσετε."
                            ]
                        }
                    ]
                },
                {
                    id: "messages",
                    title: "Μηνύματα στο Quick Count",
                    blocks: [
                        {
                            terms: [
                                ["«… saved a count of N while you were counting, so yours wasn't saved»", "Δύο άτομα μέτρησαν το ίδιο είδος στην ίδια τοποθεσία. Ο δικός σας αριθμός είναι ακόμα στο πεδίο. Συνεννοηθείτε με τον συνάδελφο για τον σωστό αριθμό και πατήστε ξανά Save count."],
                                ["«Someone reset this count while you were counting…»", "Κάποιος μηδένισε τη μέτρηση στο μεταξύ (admin με το Reset Counts ή συνάδελφος με το Actually, not counted yet). Ελέγξτε τον αριθμό και αποθηκεύστε ξανά."],
                                ["«This item isn't assigned to this location anymore…»", "Κάποιος μετακίνησε όλο το απόθεμα από αυτή την τοποθεσία την ώρα που μετρούσατε. Γυρίστε πίσω στη λίστα."],
                                ["«Can't reach the server…» / «Check your connection…»", "Η συσκευή δεν είναι συνδεδεμένη στο Wi-Fi. Συνδεθείτε ξανά και δοκιμάστε πάλι."]
                            ]
                        }
                    ]
                },
                {
                    id: "afterCount",
                    title: "Μετά την καταμέτρηση",
                    blocks: [
                        {
                            list: [
                                "Ταξινομήστε με **Staff Count** ή φιλτράρετε ανά τοποθεσία και ελέγξτε τα είδη ένα-ένα.",
                                "Πράσινο: η μέτρηση συμφωνεί, δεν χρειάζεται τίποτα.",
                                "Κόκκινο ή κίτρινο: περάστε το ποντίκι από πάνω για να δείτε ποια τοποθεσία διαφέρει και, αν χρειάζεται, ξαναμετρήστε επί τόπου.",
                                "⇄: τα τεμάχια είναι σε άλλη τοποθεσία από αυτή που ξέρει το σύστημα. Καταγράψτε με μετακίνηση (⇄) πού βρίσκονται πραγματικά· μετά το σημάδι φεύγει.",
                                "Αν λείπουν πραγματικά τεμάχια (μετρήθηκαν λιγότερα και δεν βρίσκονται σε άλλη τοποθεσία), ενημερώστε έναν admin.",
                                "Οι μετρήσεις δεν σβήνονται μόνες τους. Πριν από την επόμενη καταμέτρηση, ένας admin τις μηδενίζει με το **Reset Counts**."
                            ]
                        }
                    ]
                },
                {
                    id: "reset",
                    title: "Reset Counts (μόνο admin)",
                    blocks: [
                        {
                            list: [
                                "Το κόκκινο κουμπί **Reset Counts** σβήνει μετρήσεις του προσωπικού ώστε να ξαναμετρηθούν. Απόθεμα, αγορές και μετακινήσεις δεν αλλάζουν.",
                                "Επιλέξτε Hotel, Department (το τμήμα της σελίδας είναι ήδη επιλεγμένο), Location και Item. Ό,τι αφήσετε στο All τα περιλαμβάνει όλα.",
                                "Δείχνει πόσες μετρήσεις θα σβηστούν. Πατήστε **Reset** και μετά **Yes, reset**. Δεν αναιρείται.",
                                "Το reset καταγράφεται στο ιστορικό ενεργειών (History)."
                            ]
                        }
                    ]
                },
                {
                    id: "who",
                    title: "Ποιος μπορεί να κάνει τι",
                    blocks: [
                        {
                            terms: [
                                ["Να δει τη σελίδα", "Admin και χρήστες με πρόσβαση σε αυτή τη σελίδα."],
                                ["Προσθήκη και επεξεργασία ειδών", "Όλοι όσοι βλέπουν τη σελίδα, για τα δικά τους ξενοδοχεία. Τα στοιχεία ειδών κοινών με άλλα ξενοδοχεία: μόνο admin."],
                                ["Μετακίνηση και ιστορικό Movements", "Πρόσβαση Movements."],
                                ["Ιστορικό Purchases", "Πρόσβαση Purchases."],
                                ["Opening Quantity, Delete, Reset Counts", "Μόνο admin."],
                                ["Φίλτρο Hotel", "Χρήστες με περισσότερα από ένα ξενοδοχεία."],
                                ["Quick Count", "Admin, χρήστες με πρόσβαση σε σελίδα ειδών και το προσωπικό καταμέτρησης (χρήστες Quick Count)."]
                            ]
                        },
                        "Ποια ξενοδοχεία και ποιο τμήμα βλέπει ο καθένας ορίζεται για κάθε χρήστη στη σελίδα Users."
                    ]
                }
            ]
        };
    }


    return {
        buttonTooltip: "How this page works",
        title: "How this page works",
        hint: "Click a section to open it.",
        sections: [
            {
                id: "overview",
                title: "What this page shows",
                blocks: [
                    `This page lists every ${department} item for the hotels you have access to. All numbers only count your hotels (or, if you use the **Hotel** filter, only the hotels you checked).`,
                    "Stock is always kept in locations (Bar, Store, Restaurant…). Every hotel also has a location called **Unassigned**: stock that is in the system but hasn't been placed in a real location yet.",
                    "Hover over things in the table (like the number in Staff Count, or the buttons) to see more details."
                ]
            },
            {
                id: "columns",
                title: "The table columns",
                blocks: [
                    {
                        terms: [
                            ["ID", "The item's number in the system."],
                            ["Image", "The item's photo. A grey icon means there is no photo yet (add one with the pencil)."],
                            ["Name, Category, Subcategory", "What the item is. A dash (-) means it has no subcategory."],
                            ["Expected Total", "How many we should have: opening quantity + purchases + stock moved in from other hotels − stock moved out to other hotels. Moves inside the same hotel don't change it."],
                            ["Assigned Quantity", "How many are in real locations right now: all locations added together, except Unassigned."],
                            ["Staff Count", "What staff counted with Quick Count. See “The Staff Count chip”."],
                            ["Missing", "Assigned Quantity − Staff Count, only for the locations that were counted (and that are in view with the filters). Above 0: staff found fewer than the system has. Below 0: they found more. 0: everything matches. “-”: no location has been counted yet."],
                            ["Locations", "Where the item has stock right now (only locations with more than 0), with the hotel name. Green locations are the ones you checked in the Location filter."],
                            ["Last column", "The buttons: edit (pencil), move (⇄), history (clock) and, for admins only, delete. Explained below."]
                        ]
                    },
                    "Click a column title to sort by it; click again to reverse the order. You can sort by ID, Name, Category, Subcategory, Expected Total, Assigned Quantity, Staff Count and Missing. Sorting uses the numbers you see, including the location filter. Items without a number (“-” or Not Counted) always go to the bottom."
                ]
            },
            {
                id: "staffCount",
                title: "The Staff Count chip",
                blocks: [
                    "The chip adds up the counts of every location of the item that was counted, and compares them with what the system says is at those same locations.",
                    {
                        legend: {
                            notCounted: "None of the item's locations has been counted yet.",
                            green: "The count matches the system.",
                            red: "Fewer were counted than the system has. The stronger the red, the bigger the shortage; a pale red means the difference is small.",
                            yellow: "More were counted than the system has.",
                            moved: "The total matches, but some locations have more and others less. Usually units were moved between locations without a move being recorded.",
                            partial: "At least one location that has stock hasn't been counted yet. The colour only compares the locations that were counted."
                        }
                    },
                    {
                        list: [
                            "Hover over the chip to see every location on its own line, for example “Bar (Marbella): counted 12, assigned 10 (+2), by maria, 12/08/2026 14:32”. Counted is what staff counted, assigned is what the system has, and the brackets show the difference. Locations with stock that nobody counted show as “not counted, assigned 5”.",
                             "The chip follows the Location filter, like Assigned Quantity: with locations checked (and Only at checked locations), it only adds up and compares those locations, and only those show when you hover. With no location checked, or with Hotel-wide total, it looks at all locations.",
                            "Unassigned is never counted.",
                            "Counts stay until they are reset. They don't disappear when stock is moved: if all the stock leaves a counted location, its count stays and the chip can turn yellow. That's expected; the count can be reset if it's no longer needed."
                        ]
                    }
                ]
            },
            {
                id: "search",
                title: "Search, filters and display",
                blocks: [
                    {
                        terms: [
                            ["Search", "Type in the search box. **Search In** chooses where to look: All Fields (name, category and supplier), Name, Category or Supplier."],
                            ["Filters", "Opens the filter panel: Category, Subcategory, Location, Supplier and Hotel. Inside one group, an item needs to match any of the checked boxes; across groups it needs to match all of them. **Clear all filters** unchecks everything."],
                            ["Location filter", "Shows the items that have stock at any of the checked locations, and turns those locations green in the table. A name like “Store” means the Store of every hotel you see; to look at one hotel only, check it in the Hotel filter too."],
                            ["Hotel filter", "Only for users with more than one hotel. Expected Total, Assigned Quantity and Missing are calculated again for the checked hotels only."],
                            ["Quantity columns switch", "At the bottom of the filter panel. **Only at checked locations** (the default): when locations are checked,   Assigned Quantity and Staff Count only show those locations, and sorting and the .XLSX use the same numbers. **Hotel-wide total**: they always show all locations. Missing follows the same locations. Expected Total is always hotel-wide."],
                            ["Small / Medium / Large", "Makes the table smaller or bigger. Your browser remembers the choice."],
                            ["Rows per page", "At the bottom: 25, 50, 100 or All."],
                            [".XLSX", "Downloads an Excel file with every item that matches the search and filters (all pages, in the current order). It has the same columns and numbers as the table, including the location filter: ID, Name, Category, Subcategory, Expected Total, Assigned Quantity, Staff Count, Missing, Locations."],
                            ...(hasQuickCountButton
                                ? [["Phone button", "Opens Quick Count in a new tab."]]
                                : [])
                        ]
                    }
                ]
            },
            {
                id: "items",
                title: "Adding and editing items",
                blocks: [
                    "**Add Item** opens an empty form. Only **Item Name** and **Category** are required.",
                    {
                        terms: [
                            ["Item Name", "Must be unique. If the name is already used, you'll see “An item with this name already exists”."],
                            ["Subcategory (optional)", "Pick the Category first; the list then shows only that category's subcategories. **None** means no subcategory."],
                            ["Supplier", "Who we usually buy it from."],
                            ["Hotels", "The hotels that use this item; at least one. You can only add or remove your own hotels (unless you have access to all hotels). Stock can only be received or moved into a hotel on this list."],
                            ["Cost per unit", "The price of one unit."],
                            ["Opening Quantity - (hotel)", "Admin only, one box per hotel. The starting stock the Expected Total is built from. Change it only after a full physical count. It doesn't put stock into any location."],
                            ["Choose Image", "Adds or replaces the photo. The small x next to it removes it."]
                        ]
                    },
                    "The **pencil** opens the same form for an existing item.",
                    {
                        list: [
                            "If the item is shared with a hotel that isn't yours, only an admin can change its details. You can still add or remove your own hotels.",
                            "A hotel can't be removed from an item while it still has stock of it. Move the stock out first."
                        ]
                    }
                ]
            },
            {
                id: "move",
                title: "Moving stock (⇄)",
                blocks: [
                    "The ⇄ button moves units of the item from one location to another. Only users with **Movements** access see it.",
                    {
                        terms: [
                            ["From", "Only locations that have stock, with how many are available."],
                            ["To", "The location the units go to."],
                            ["Quantity", "How many. It can't be more than what is available."],
                            ["Reason (optional)", "A short note, for example “for event”."]
                        ]
                    },
                    {
                        list: [
                            "The item must belong to the destination hotel. If it doesn't, you'll see “This item isn't part of … yet”: add the hotel to the item with the pencil first.",
                            "Hotel users can only move between their own hotels' locations.",
                            "Moving out of Unassigned into a real location raises Assigned Quantity.",
                            "Moving to another hotel lowers one hotel's Expected Total and raises the other's.",
                            "If the item has no stock anywhere, it can't be moved. Stock first gets into a location through a purchase (received into a location on the Purchases page).",
                            "Every move is saved and shows in the item's history → Movements."
                        ]
                    }
                ]
            },
            {
                id: "history",
                title: "History",
                blocks: [
                    "The clock button shows the item's history: **Purchases** (needs Purchases access) and **Movements** (needs Movements access). You only see the choices you have access to."
                ]
            },
            {
                id: "delete",
                title: "Deleting an item (admin only)",
                blocks: [
                    {
                        list: [
                            "The black button with the red bin is only shown to admins.",
                            "**Delete** only works when the item's stock is only in Unassigned and it has no purchase or movement history.",
                            "**Delete with history** removes the item together with all its purchases and moves, as if it never existed. You have to type the item's exact name first. It can't be undone: use it only for test items or mistakes."
                        ]
                    }
                ]
            },
            {
                id: "quickCount",
                title: "Quick Count (phone / PDA)",
                blocks: [
                    `Quick Count is the counting screen for phones and PDAs. It opens at **${quickCountAddress}**.`,
                    {
                        steps: [
                            "Log in with your own username and password.",
                            "**Which hotel are you counting?** Choose the hotel. You only see your own hotels.",
                            "**Where are you working right now?** Choose the location you are standing in.",
                            "The list shows every item that has stock at this location, A to Z, with its photo. Use the search box to find one quickly. A green **Counted: N** means it has already been counted.",
                            "Tap an item. Tap the photo to see it bigger. Count all the units of this item at this location, then set the number with − and +, or tap the number and type it.",
                            "Press **Save count**. You go back to the list and the item shows as counted."
                        ]
                    },
                    {
                        list: [
                            "Saving again replaces the previous count; it doesn't add to it. The screen shows who counted last and when.",
                            "**Actually, not counted yet** removes the count of this item at this location (for example after a mistake). Counting staff can only undo their own counts.",
                            "An item that is physically there but isn't in the list isn't assigned to this location in the system. Don't skip it: tell a manager, who can move it there with ⇄ so it appears.",
                            "You only see the items of your own department (admins see all).",
                            "After 60 minutes without saving anything, you are logged out. Every save or undo gives another 60 minutes. On shared PDAs, always press **Log out** (top right of the hotel / location screen) when you finish."
                        ]
                    }
                ]
            },
            {
                id: "messages",
                title: "Quick Count messages",
                blocks: [
                    {
                        terms: [
                            ["“… saved a count of N while you were counting, so yours wasn't saved”", "Two people counted the same item at the same location. Your number is still in the box. Agree with your colleague on the right number and press Save count again."],
                            ["“Someone reset this count while you were counting…”", "The count was cleared in the meantime (by an admin with Reset Counts, or by a colleague with Actually, not counted yet). Check the number and save again."],
                            ["“This item isn't assigned to this location anymore…”", "Someone moved all its stock out of this location while you were counting. Go back to the list."],
                            ["“Can't reach the server…” / “Check your connection…”", "The device isn't on the Wi-Fi. Reconnect and try again."]
                        ]
                    }
                ]
            },
            {
                id: "afterCount",
                title: "After the count",
                blocks: [
                    {
                        list: [
                            "Sort by **Staff Count**, or filter by location, and go through the items.",
                            "Green: the count matches, nothing to do.",
                            "Red or yellow: hover over the chip to see which location is different, and count it again on site if needed.",
                            "⇄: the units are in a different location than the system thinks. Record where they really are with a move (⇄); the marker then goes away.",
                            "If units are really missing (fewer were counted and they aren't in another location), tell an admin.",
                            "Counts don't clear by themselves. Before the next count, an admin clears them with **Reset Counts**."
                        ]
                    }
                ]
            },
            {
                id: "reset",
                title: "Reset Counts (admin only)",
                blocks: [
                    {
                        list: [
                            "The red **Reset Counts** button clears staff counts so they can be counted again. Stock, purchases and moves are not touched.",
                            "Choose Hotel, Department (this page's department is already picked), Location and Item. Anything left on All includes everything.",
                            "It shows how many counts will be cleared. Press **Reset**, then **Yes, reset**. It can't be undone.",
                            "The reset is recorded in the History log."
                        ]
                    }
                ]
            },
            {
                id: "who",
                title: "Who can do what",
                blocks: [
                    {
                        terms: [
                            ["See this page", "Admins and users with access to this page."],
                            ["Add and edit items", "Everyone who sees the page, for their own hotels. Details of items shared with other hotels: admin only."],
                            ["Move, and Movements history", "Movements access."],
                            ["Purchases history", "Purchases access."],
                            ["Opening Quantity, Delete, Reset Counts", "Admin only."],
                            ["Hotel filter", "Users with more than one hotel."],
                            ["Quick Count", "Admins, users with access to an items page, and counting staff (Quick Count users)."]
                        ]
                    },
                    "Which hotels and which department each person sees is set per user on the Users page."
                ]
            }
        ]
    };
}


//**bold** inside the help text
function Rich({ text }) {

    const parts = text.split("**");

    return parts.map((part, index) =>
        index % 2 === 1 ? <b key={index}>{part}</b> : <span key={index}>{part}</span>
    );
}


function LegendChip({ kind }) {

    const chip = LEGEND_CHIPS[kind];

    return (
        <Chip
            label={chip.label}
            size="small"
            variant={chip.variant || "filled"}
            sx={{ fontWeight: "bold", ...(chip.style || {}) }}
        />
    );
}


//colour key for the Staff Count chip, drawn with the real colours
function Legend({ texts }) {

    const rows = [
        { key: "notCounted", sample: <LegendChip kind="notCounted" /> },
        { key: "green", sample: <LegendChip kind="green" /> },
        {
            key: "red",
            sample: (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <LegendChip kind="red" />
                    <LegendChip kind="paleRed" />
                </Box>
            )
        },
        { key: "yellow", sample: <LegendChip kind="yellow" /> },
        {
            key: "moved",
            sample: (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <LegendChip kind="green" />
                    <SwapHorizIcon fontSize="small" sx={{ color: "warning.main" }} />
                </Box>
            )
        },
        {
            key: "partial",
            sample: (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <LegendChip kind="green" />
                    <Box component="span" sx={{ fontSize: "0.75em", opacity: 0.7 }}>partial</Box>
                </Box>
            )
        }
    ];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                columnGap: 2,
                rowGap: 1.5,
                alignItems: "center",
                my: 1.5,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: "#f4f6f8"
            }}
        >
            {rows.map((row) => (
                <Box key={row.key} sx={{ display: "contents" }}>
                    <Box>{row.sample}</Box>
                    <Typography variant="body2">{texts[row.key]}</Typography>
                </Box>
            ))}
        </Box>
    );
}


function Block({ block }) {

    if (typeof block === "string") {
        return (
            <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                <Rich text={block} />
            </Typography>
        );
    }

    if (block.legend) {
        return <Legend texts={block.legend} />;
    }

    //a term on the left, its explanation on the right
    if (block.terms) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 1.5 }}>
                {block.terms.map(([term, text]) => (
                    <Box key={term} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 0.25, sm: 2 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: "0 0 210px", color: NAVY }}>
                            {term}
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            <Rich text={text} />
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    }

    //steps are numbered (they happen in this order), lists are not
    const isSteps = Boolean(block.steps);
    const lines = block.steps || block.list;

    return (
        <Box
            component={isSteps ? "ol" : "ul"}
            sx={{ m: 0, mb: 1.5, pl: 3, display: "flex", flexDirection: "column", gap: 0.75 }}
        >
            {lines.map((line) => (
                <Typography key={line} component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
                    <Rich text={line} />
                </Typography>
            ))}
        </Box>
    );
}


function readSavedLanguage() {
    try {
        return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "el";
    } catch {
        return "el";
    }
}


function ItemsHelpButton({ department, hasQuickCountButton = false }) {

    const [open, setOpen] = useState(false);
    const [language, setLanguage] = useState(readSavedLanguage);

    //the address this page was opened from, so it's right on the laptop and on the server
    const quickCountAddress = `${window.location.origin}/quick-count`;

    const text = content(language, department, quickCountAddress, hasQuickCountButton);

    const changeLanguage = (event, value) => {

        if (!value) {
            return;
        }

        setLanguage(value);

        try {
            localStorage.setItem(LANGUAGE_KEY, value);
        } catch {
            //not saved, the help still works
        }
    };


    return (
        <>
            <Tooltip title={text.buttonTooltip}>
                <IconButton onClick={() => setOpen(true)} sx={{ ml: 1, color: NAVY }}>
                    <InfoOutlinedIcon />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" scroll="paper">

                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, pr: 1 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography component="span" sx={{ display: "block", fontSize: "1.25rem", fontWeight: 600, color: NAVY }}>
                            {text.title}
                        </Typography>
                        <Typography component="span" variant="body2" sx={{ display: "block", color: "text.secondary" }}>
                            {department} Items · {text.hint}
                        </Typography>
                    </Box>

                    <ToggleButtonGroup size="small" exclusive value={language} onChange={changeLanguage}>
                        <ToggleButton value="el" sx={{ px: 1.5, fontWeight: 600 }}>ΕΛ</ToggleButton>
                        <ToggleButton value="en" sx={{ px: 1.5, fontWeight: 600 }}>EN</ToggleButton>
                    </ToggleButtonGroup>

                    <IconButton onClick={() => setOpen(false)} aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    {text.sections.map((section) => (
                        <Accordion
                            key={section.id}
                            disableGutters
                            elevation={0}
                            square
                            sx={{
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3 }}>
                                <Typography sx={{ fontWeight: 600, color: NAVY }}>
                                    {section.title}
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails sx={{ px: 3, pt: 0, pb: 2 }}>
                                {section.blocks.map((block, index) => (
                                    <Block key={index} block={block} />
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </DialogContent>

            </Dialog>
        </>
    );
}


export default ItemsHelpButton;
