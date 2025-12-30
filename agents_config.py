"""
Agent configuration and static data
"""
from avatars_config import get_avatar_data_url

# Get avatars (will use PNG if available, otherwise emoji)
def get_agent_avatar(agent_id: str) -> str:
    return get_avatar_data_url(agent_id)

AGENTS_DATA = [
    {
        "id": "isabella",
        "name": "Isabella",
        "role": "Recepční na telefonu",
        "avatar": get_agent_avatar("isabella"),
        "notification": "3 nové hovory čekají na zpracování",
        "kpis": [
            ["📞 Zpracované hovory", "128"],
            ["🌑 Mimo pracovní dobu", "14"]
        ],
        "mini_kpis": [
            ["📞", "128"],
            ["🌑", "14"],
            ["✅", "94%"],
            ["⏱️", "2.3m"]
        ],
        "rows": [
            {"Pacient": "Jan Novák", "Důvod hovoru": "Hygiena", "Požadavek": "Objednat", "Čas": "14:30", "Výsledek": "✅ Rezervace potvrzena", "Popis problému": ""},
            {"Pacient": "Petra Dvořáková", "Důvod hovoru": "Kontrola", "Požadavek": "Přesunout", "Čas": "10:15", "Výsledek": "✅ Rezervace potvrzena", "Popis problému": ""},
            {"Pacient": "Lukáš Beneš", "Důvod hovoru": "Bolest", "Požadavek": "Objednat", "Čas": "9:00", "Výsledek": "📞 Přepojeno na recepci", "Popis problému": "Hovor byl přepojen na recepci, je potřeba zkontrolovat, zda byl problém vyřešen a zda pacient obdržel potřebné informace."},
            {"Pacient": "Eva Kovářová", "Důvod hovoru": "Rentgen", "Požadavek": "Informace", "Čas": "16:00", "Výsledek": "✅ Rezervace potvrzena", "Popis problému": ""},
            {"Pacient": "Martin Svoboda", "Důvod hovoru": "Nový pacient", "Požadavek": "Objednat", "Čas": "11:45", "Výsledek": "✅ Rezervace potvrzena", "Popis problému": ""},
            {"Pacient": "Tereza Kučerová", "Důvod hovoru": "Zrušení termínu", "Požadavek": "Zrušit", "Čas": "13:30", "Výsledek": "⏳ Čeká na potvrzení SMS", "Popis problému": "SMS potvrzení o zrušení termínu nebylo dosud doručeno. Zkontrolujte stav odeslání a v případě potřeby znovu odešlete potvrzovací SMS zprávu."},
            {"Pacient": "Pavel Černý", "Důvod hovoru": "Kontrola", "Požadavek": "Objednat", "Čas": "15:15", "Výsledek": "✅ Rezervace potvrzena", "Popis problému": ""},
            {"Pacient": "Jana Malá", "Důvod hovoru": "Hygiena", "Požadavek": "Přesunout", "Čas": "12:00", "Výsledek": "✅ Rezervace potvrzena", "Popis problému": ""}
        ],
        "simulation_tasks": [
            {"task": "Zavolat zpět paní Dvořákové ohledně zrušeného termínu", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Potvrdit SMS pro pana Nováka na zítřejší kontrolu", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Přesunout termín pro Evu Kovářovou z 15:00 na 16:30", "priority": "Střední", "status": "Čeká"}
        ]
    },
    {
        "id": "leo",
        "name": "Leo",
        "role": "Příprava karet pacientů",
        "avatar": get_agent_avatar("leo"),
        "notification": "5 karet pacientů čeká na import",
        "kpis": [
            ["📘 Vytvořené karty", "8"],
            ["📕 Zpracované archivy", "52"]
        ],
        "mini_kpis": [
            ["📘", "8"],
            ["📕", "52"],
            ["✅", "98%"],
            ["⏱️", "1.5m"]
        ],
        "rows": [
            {"Soubor": "patient_card_1.pdf", "Status": "✅ Nahráno", "Velikost": "856 kB", "Archiv": "archiv_2", "Popis problému": ""},
            {"Soubor": "patient_card_2.pdf", "Status": "✅ Nahráno", "Velikost": "423 kB", "Archiv": "archiv_1", "Popis problému": ""},
            {"Soubor": "patient_card_3.pdf", "Status": "⚠️ Chybí příloha", "Velikost": "234 kB", "Archiv": "archiv_3", "Popis problému": "V karetě pacienta chybí povinná příloha (pravděpodobně kopie občanského průkazu nebo pojišťovací karty). Zkontrolujte dokumentaci a doplňte chybějící přílohu před archivací."},
            {"Soubor": "patient_card_4.pdf", "Status": "✅ Nahráno", "Velikost": "1087 kB", "Archiv": "archiv_2", "Popis problému": ""},
            {"Soubor": "patient_card_5.pdf", "Status": "✅ Nahráno", "Velikost": "645 kB", "Archiv": "archiv_4", "Popis problému": ""},
            {"Soubor": "patient_card_6.pdf", "Status": "⏳ Ve frontě", "Velikost": "512 kB", "Archiv": "archiv_1", "Popis problému": "Karta pacienta čeká ve frontě na zpracování již delší dobu. Zkontrolujte, zda nedošlo k chybě při importu a případně znovu spusťte proces nahrání."},
            {"Soubor": "patient_card_7.pdf", "Status": "✅ Nahráno", "Velikost": "789 kB", "Archiv": "archiv_3", "Popis problému": ""},
            {"Soubor": "patient_card_8.pdf", "Status": "✅ Nahráno", "Velikost": "956 kB", "Archiv": "archiv_2", "Popis problému": ""}
        ],
        "simulation_tasks": [
            {"task": "Zkontrolovat a doplnit chybějící přílohy u karty patient_card_3.pdf", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Ověřit správnost importu do archivu_2", "priority": "Střední", "status": "Čeká"},
            {"task": "Archivovat dokončené karty z minulého týdne", "priority": "Nízká", "status": "Čeká"}
        ]
    },
    {
        "id": "gabriel",
        "name": "Gabriel",
        "role": "Kontrola e-mailů",
        "avatar": get_agent_avatar("gabriel"),
        "notification": "7 e-mailů vyžaduje okamžitou pozornost",
        "kpis": [
            ["📪 Zpracované e-maily", "121"],
            ["⚠️ Nalezené problémy", "7"]
        ],
        "mini_kpis": [
            ["📪", "121"],
            ["⚠️", "7"],
            ["✅", "91%"],
            ["⏱️", "3.1m"]
        ],
        "rows": [
            {"Odesílatel": "patient15@mail.cz", "Téma": "Dotaz na pojištění", "Zjištěno": "Ano", "Komentář": "⚠️ Vyžaduje reakci", "Popis problému": "Pacient se dotazuje na krytí pojišťovnou pro konkrétní zákrok. Je potřeba zkontrolovat jeho pojištění a odpovědět s přesnými informacemi o hrazení léčby."},
            {"Odesílatel": "patient23@mail.cz", "Téma": "Zrušení termínu", "Zjištěno": "Ne", "Komentář": "✅ Zpracováno automaticky", "Popis problému": ""},
            {"Odesílatel": "patient8@mail.cz", "Téma": "Neodpovězený e-mail", "Zjištěno": "Ano", "Komentář": "⚠️ Vyžaduje reakci", "Popis problému": "E-mail od pacienta zůstal neodpovězený déle než 48 hodin. Je nutné neprodleně odpovědět a omluvit se za zpoždění, případně nabídnout alternativní řešení."},
            {"Odesílatel": "patient42@mail.cz", "Téma": "Pozdní potvrzení", "Zjištěno": "Ne", "Komentář": "✅ Zpracováno automaticky", "Popis problému": ""},
            {"Odesílatel": "patient31@mail.cz", "Téma": "Přeposlaný mail", "Zjištěno": "Ne", "Komentář": "✅ Zpracováno automaticky", "Popis problému": ""},
            {"Odesílatel": "patient19@mail.cz", "Téma": "Dotaz na pojištění", "Zjištěno": "Ne", "Komentář": "✅ Zpracováno automaticky", "Popis problému": ""},
            {"Odesílatel": "patient5@mail.cz", "Téma": "Zrušení termínu", "Zjištěno": "Ano", "Komentář": "⚠️ Vyžaduje reakci", "Popis problému": "Pacient žádá o zrušení termínu, ale automatické potvrzení nebylo odesláno. Zkontrolujte důvod zrušení a potvrďte pacientovi zrušení termínu, případně nabídněte náhradní termín."},
            {"Odesílatel": "patient37@mail.cz", "Téma": "Neodpovězený e-mail", "Zjištěno": "Ne", "Komentář": "✅ Zpracováno automaticky", "Popis problému": ""}
        ],
        "simulation_tasks": [
            {"task": "Odpovědět na dotaz ohledně pojištění od patient15@mail.cz", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Vyřídit neodpovězený e-mail o změně termínu", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Přeposlat urgentní zprávu lékaři", "priority": "Střední", "status": "Čeká"}
        ]
    },
    {
        "id": "nora",
        "name": "Nora",
        "role": "Shrnutí pacienta",
        "avatar": get_agent_avatar("nora"),
        "notification": "2 shrnutí pacientů připraveno ke kontrole",
        "kpis": [
            ["🕐 Ušetřený čas", "86 min"],
            ["🧾 Shrnutých pacientů", "12"]
        ],
        "mini_kpis": [
            ["🕐", "86m"],
            ["🧾", "12"],
            ["✅", "100%"],
            ["⏱️", "4.2m"]
        ],
        "rows": [
            {"Pacient": "Eva Dvořáková", "Pojišťovna": "VZP", "Shrnutí": "Bez kazů", "Čas přípravy": "3 min", "Popis problému": ""},
            {"Pacient": "Jan Šimek", "Pojišťovna": "OZP", "Shrnutí": "Doporučena hygiena", "Čas přípravy": "2 min", "Popis problému": ""},
            {"Pacient": "Lucie Malá", "Pojišťovna": "ZPMV", "Shrnutí": "Drobné záněty", "Čas přípravy": "5 min", "Popis problému": "U pacientky byly zjištěny drobné záněty dásní. Je potřeba zkontrolovat kompletní anamnézu a doporučit vhodnou léčbu nebo preventivní opatření."},
            {"Pacient": "Milan Novotný", "Pojišťovna": "ČPZP", "Shrnutí": "Bez kazů", "Čas přípravy": "4 min", "Popis problému": ""},
            {"Pacient": "Tereza Jelínková", "Pojišťovna": "VZP", "Shrnutí": "Doporučena hygiena", "Čas přípravy": "3 min", "Popis problému": ""},
            {"Pacient": "Petr Novák", "Pojišťovna": "OZP", "Shrnutí": "Nutná kontrola", "Čas přípravy": "6 min", "Popis problému": "Shrnutí pacienta vyžaduje další kontrolu. Zkontrolujte kompletní záznamy a ověřte, zda jsou všechny údaje správně zaznamenány před finálním schválením."},
            {"Pacient": "Markéta Svobodová", "Pojišťovna": "VZP", "Shrnutí": "Bez kazů", "Čas přípravy": "2 min", "Popis problému": ""},
            {"Pacient": "Tomáš Veselý", "Pojišťovna": "ZPMV", "Shrnutí": "Doporučena hygiena", "Čas přípravy": "4 min", "Popis problému": ""}
        ],
        "simulation_tasks": [
            {"task": "Zkontrolovat a schválit shrnutí pro pacienta Jana Šimka", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Doplnit poznámky k nálezu u Lucie Malé", "priority": "Střední", "status": "Čeká"},
            {"task": "Ověřit správnost údajů pojišťovny u 3 pacientů", "priority": "Nízká", "status": "Čeká"}
        ]
    },
    {
        "id": "auditor",
        "name": "Auditor",
        "role": "Kontrola záznamů",
        "avatar": get_agent_avatar("auditor"),
        "notification": "3 nesrovnalosti nalezeny při auditu",
        "kpis": [
            ["📋 Zkontrolované záznamy", "245"],
            ["⚠️ Nalezené problémy", "3"]
        ],
        "mini_kpis": [
            ["📋", "245"],
            ["⚠️", "3"],
            ["✅", "99%"],
            ["⏱️", "0.8m"]
        ],
        "rows": [
            {"Pacient": "Jan Novák", "Problém": "Chybí podpis lékaře", "Priorita": "Vysoká", "Link": "https://dentalsystem.cz/record/1", "Popis problému": "V záznamu pacienta chybí povinný podpis ošetřujícího lékaře. Zkontrolujte dokumentaci a zajistěte doplnění podpisu před archivací záznamu."},
            {"Pacient": "Petra Svobodová", "Problém": "Nesoulad fakturace", "Priorita": "Vysoká", "Link": "https://dentalsystem.cz/record/2", "Popis problému": "Byl zjištěn nesoulad mezi provedenými zákroky a fakturovanými položkami. Je nutné zkontrolovat fakturaci a opravit případné chyby v účtování."},
            {"Pacient": "Tomáš Dvořák", "Problém": "Neúplná anamnéza", "Priorita": "Střední", "Link": "https://dentalsystem.cz/record/3", "Popis problému": "Anamnéza pacienta je neúplná - chybí některé povinné údaje. Doplňte chybějící informace do anamnézy před dalším použitím záznamu."},
            {"Pacient": "Eva Malá", "Problém": "Chybějící rentgen", "Priorita": "Nízká", "Link": "https://dentalsystem.cz/record/4", "Popis problému": "K záznamu pacientky chybí rentgenový snímek, který byl zmíněn v dokumentaci. Zkontrolujte, zda byl snímek nahrán do systému, nebo zda je potřeba ho doplnit."},
            {"Pacient": "Lukáš Černý", "Problém": "Duplicitní záznam", "Priorita": "Střední", "Link": "https://dentalsystem.cz/record/5", "Popis problému": "Byl nalezen duplicitní záznam pro stejného pacienta. Zkontrolujte oba záznamy, rozhodněte, který je správný, a odstraňte nebo sloučte duplicitní záznam."}
        ],
        "simulation_tasks": [
            {"task": "Doplnit chybějící podpis lékaře u záznamu pana Nováka", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Opravit nesoulad ve fakturaci u záznamu #1247", "priority": "Vysoká", "status": "Čeká"},
            {"task": "Zkontrolovat duplicitní záznamy v systému", "priority": "Střední", "status": "Čeká"}
        ]
    }
]