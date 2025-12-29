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
            rows.append({
                "Pacient": random.choice(self.CZECH_NAMES),
                "Důvod hovoru": random.choice(self.CALL_REASONS),
                "Požadavek": random.choice(self.REQUESTS),
                "Čas": f"{random.randint(8, 17)}:{random.choice(['00','15','30','45'])}",
                "Výsledek": status
            })
        return rows
    
    def simulate_gabriel(self, n=8):
        """Simulate email monitoring data"""
        if n == 0:
            return []
        
        rows = []
        for _ in range(n):
            zjisteno = "Ne" if random.random() < 0.75 else "Ano"
            rows.append({
                "Odesílatel": f"patient{random.randint(1,50)}@mail.cz",
                "Téma": random.choice(self.EMAIL_ISSUES),
                "Zjištěno": zjisteno,
                "Komentář": random.choice([
                    "⚠️ Vyžaduje reakci",
                    "✅ Zpracováno automaticky"
                ])
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
            rows.append({
                "Pacient": random.choice(self.CZECH_NAMES),
                "Pojišťovna": random.choice(self.INSURANCES),
                "Shrnutí": finding,
                "Čas přípravy": f"{random.randint(1,6)} min"
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
            rows.append({
                "Soubor": f"patient_card_{i+1}.pdf",
                "Status": status,
                "Velikost": f"{random.randint(120,1200)} kB",
                "Archiv": f"archiv_{random.randint(1,4)}"
            })
        return rows
    
    def simulate_auditor(self, n=5):
        """Simulate audit data"""
        if n == 0:
            return []
        
        rows = []
        for i in range(n):
            rows.append({
                "Pacient": random.choice(self.CZECH_NAMES),
                "Problém": random.choice(self.AUDIT_ISSUES),
                "Priorita": random.choice(self.PRIORITIES),
                "Link": f"https://dentalsystem.cz/record/{i+1}"
            })
        return rows