"""
Data simulation utilities for generating test data
"""
import random

class DataSimulator:
    """Handles simulation of various data types for different agents"""
    
    # Common data pools
    CZECH_NAMES = [
        "Jan Novák", "Petra Dvořáková", "Lukáš Beneš", 
        "Eva Kovářová", "Martin Svoboda", "Tereza Kučerová",
        "Pavel Černý", "Jana Malá", "Tomáš Dvořák",
        "Eva Malá", "Lukáš Černý", "Markéta Svobodová",
        "Tomáš Veselý", "Petr Novák", "Tereza Jelínková",
        "Milan Novotný", "Lucie Malá", "Jan Šimek"
    ]
    
    CALL_REASONS = [
        "Hygiena", "Kontrola", "Bolest", "Rentgen", 
        "Nový pacient", "Zrušení termínu"
    ]
    
    REQUESTS = ["Objednat", "Zrušit", "Přesunout", "Informace"]
    
    EMAIL_ISSUES = [
        "Zrušení termínu", "Neodpovězený e-mail", 
        "Dotaz na pojištění", "Pozdní potvrzení", "Přeposlaný mail"
    ]
    
    INSURANCES = ["VZP", "OZP", "ZPMV", "ČPZP"]
    
    FINDINGS_POSITIVE = ["Bez kazů", "Doporučena hygiena"]
    FINDINGS_OTHER = ["Drobné záněty", "Nutná kontrola"]
    
    AUDIT_ISSUES = [
        "Chybí podpis lékaře", "Nesoulad fakturace", 
        "Neúplná anamnéza", "Chybějící rentgen", "Duplicitní záznam"
    ]
    
    PRIORITIES = ["Vysoká", "Střední", "Nízká"]
    
    def simulate_isabella(self, n=8):
        """Simulate phone reception data"""
        if n == 0:
            return []
        
        rows = []
        for _ in range(n):
            status = "✅ Rezervace potvrzena" if random.random() < 0.75 else random.choice([
                "📞 Přepojeno na recepci", 
                "⏳ Čeká na potvrzení SMS"
            ])
            problem_desc = ""
            if status != "✅ Rezervace potvrzena":
                if "📞" in status:
                    problem_desc = f"Hovor byl přepojen na recepci. Zkontrolujte, zda byl problém vyřešen a zda pacient obdržel potřebné informace."
                elif "⏳" in status:
                    problem_desc = f"SMS potvrzení nebylo dosud doručeno. Zkontrolujte stav odeslání a v případě potřeby znovu odešlete potvrzovací SMS zprávu."
            
            rows.append({
                "Pacient": random.choice(self.CZECH_NAMES),
                "Důvod hovoru": random.choice(self.CALL_REASONS),
                "Požadavek": random.choice(self.REQUESTS),
                "Čas": f"{random.randint(8, 17)}:{random.choice(['00','15','30','45'])}",
                "Výsledek": status,
                "Popis problému": problem_desc
            })
        return rows
    
    def simulate_gabriel(self, n=8):
        """Simulate email monitoring data"""
        if n == 0:
            return []
        
        rows = []
        for _ in range(n):
            zjisteno = "Ne" if random.random() < 0.75 else "Ano"
            comment = random.choice([
                "⚠️ Vyžaduje reakci",
                "✅ Zpracováno automaticky"
            ])
            problem_desc = ""
            if "⚠️" in comment or zjisteno == "Ano":
                if "pojištění" in random.choice(self.EMAIL_ISSUES).lower():
                    problem_desc = "Pacient se dotazuje na krytí pojišťovnou. Zkontrolujte jeho pojištění a odpovězte s přesnými informacemi o hrazení léčby."
                elif "neodpovězený" in random.choice(self.EMAIL_ISSUES).lower():
                    problem_desc = "E-mail od pacienta zůstal neodpovězený déle než 48 hodin. Je nutné neprodleně odpovědět a omluvit se za zpoždění."
                else:
                    problem_desc = "E-mail vyžaduje okamžitou pozornost. Zkontrolujte obsah a odpovězte pacientovi co nejdříve."
            
            rows.append({
                "Odesílatel": f"patient{random.randint(1,50)}@mail.cz",
                "Téma": random.choice(self.EMAIL_ISSUES),
                "Zjištěno": zjisteno,
                "Komentář": comment,
                "Popis problému": problem_desc
            })
        return rows
    
    def simulate_nora(self, n=8):
        """Simulate patient summary data"""
        if n == 0:
            return []
        
        rows = []
        for _ in range(n):
            finding = random.choice(
                self.FINDINGS_POSITIVE if random.random() < 0.75 
                else self.FINDINGS_OTHER
            )
            problem_desc = ""
            if finding in self.FINDINGS_OTHER:
                problem_desc = f"U pacienta byly zjištěny {finding.lower()}. Je potřeba zkontrolovat kompletní anamnézu a doporučit vhodnou léčbu nebo preventivní opatření."
            
            rows.append({
                "Pacient": random.choice(self.CZECH_NAMES),
                "Pojišťovna": random.choice(self.INSURANCES),
                "Shrnutí": finding,
                "Čas přípravy": f"{random.randint(1,6)} min",
                "Popis problému": problem_desc
            })
        return rows
    
    def simulate_leo(self, n=8):
        """Simulate patient card preparation data"""
        if n == 0:
            return []
        
        rows = []
        for i in range(n):
            status = "✅ Nahráno" if random.random() < 0.75 else random.choice([
                "⚠️ Chybí příloha",
                "⏳ Ve frontě"
            ])
            problem_desc = ""
            if "⚠️" in status:
                problem_desc = "V karetě pacienta chybí povinná příloha. Zkontrolujte dokumentaci a doplňte chybějící přílohu před archivací."
            elif "⏳" in status:
                problem_desc = "Karta pacienta čeká ve frontě na zpracování již delší dobu. Zkontrolujte, zda nedošlo k chybě při importu."
            
            rows.append({
                "Soubor": f"patient_card_{i+1}.pdf",
                "Status": status,
                "Velikost": f"{random.randint(120,1200)} kB",
                "Archiv": f"archiv_{random.randint(1,4)}",
                "Popis problému": problem_desc
            })
        return rows
    
    def simulate_auditor(self, n=5):
        """Simulate audit data"""
        if n == 0:
            return []
        
        rows = []
        for i in range(n):
            problem = random.choice(self.AUDIT_ISSUES)
            problem_desc = ""
            if "podpis" in problem.lower():
                problem_desc = "V záznamu pacienta chybí povinný podpis ošetřujícího lékaře. Zkontrolujte dokumentaci a zajistěte doplnění podpisu."
            elif "fakturace" in problem.lower():
                problem_desc = "Byl zjištěn nesoulad mezi provedenými zákroky a fakturovanými položkami. Je nutné zkontrolovat fakturaci a opravit chyby."
            elif "anamnéza" in problem.lower():
                problem_desc = "Anamnéza pacienta je neúplná - chybí některé povinné údaje. Doplňte chybějící informace do anamnézy."
            elif "rentgen" in problem.lower():
                problem_desc = "K záznamu pacienta chybí rentgenový snímek, který byl zmíněn v dokumentaci. Zkontrolujte, zda byl snímek nahrán."
            elif "duplicitní" in problem.lower():
                problem_desc = "Byl nalezen duplicitní záznam pro stejného pacienta. Zkontrolujte oba záznamy a odstraňte nebo sloučte duplicitní záznam."
            
            rows.append({
                "Pacient": random.choice(self.CZECH_NAMES),
                "Problém": problem,
                "Priorita": random.choice(self.PRIORITIES),
                "Link": f"https://dentalsystem.cz/record/{i+1}",
                "Popis problému": problem_desc
            })
        return rows