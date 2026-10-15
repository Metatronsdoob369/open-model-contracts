
cs642
  network security
adam everspaugh 
               ace@cs.wisc.edu 
computer security
today
Domain name system (DNS) 
CIDR 
Border Gateway Protocol
dns
Which	one	is	easier	to	remember?
54.239.25.208	
172.111.64.124	
74.125.193.16	
23.235.40.65	
17.172.100.13	
128.105.123.66
IP	addresses
www.amazon.com	
theverge.com	
googlemail-smtp.l.google.com	
hosted-cdn.statuspage.io	
p05-calendars.icloud.com	
print-gw.cs.wisc.edu
Domain	Name
Domain	Name	System	(DNS)		
				translates	domain	names->IP	addresses	
Hierarchical	domain	name	space
cs ece
www
ICANN	(Internet	Corporation	for	Assigned	
Names	and	Numbers)
root	nameservers	and	authoritative	nameservers
Zone:	subtree
Second	Level	
domainswisc umich pepperdine
Top	Level	
domains	
(TLD)org net edu com io ca
root
Name	Servers
[http://en.wikipedia.org/wiki/File:An_example_of_theoretical_DNS_recursion.svg]
Authoritative name servers
Programmed	by	an		
original	sourceRecursively	hunts	down	an	answer
Recurser
Caching
•DNS	servers	will	cache	responses	
–Both	negative	and	positive	responses	
–Speeds	up	queries		
–Entries	expire	periodically.	Time-to-live	(TTL)	set	by	
data	owner

Example	DNS	query	types
A IPv4	address
AAAA IPv6	address
NS name	server
TXT human	readable	text
MX mail	exchange
DNS	packet	on	wire
Query	ID	is	16-bit		
random	value
Query	from	resolver	to	NS

Response contains IP addr 
of next NS server 
(called “glue”) 
Response ignored if  
unrecognized QueryID 

bailiwick	checking:	
		response	is	cached	if 
		it	is	within	the	same	 
		domain	of	query 
		(i.e.		a.com		cannot		 
							set	NS	for	b.com)	
DNS	Security
•What	security	checks	are	in	place?	
–Random	query	ID’s	to	link	responses	to	queries	
–Bailiwick	checking	(sanity	check	on	response)	
•No	authentication	
•Many	things	trust	hostname↔IP	mapping	
–Browser	same-origin	policy	
–URL	address	bar	
–Every	application	that	accesses	the	internet
DNSsec
•Authenticated	DNS	protocol	
•Used	by	TLDs	:)	
•But	no	one	else	:(
[https://www.huque.com/app/dnsstat/]	retrieved:	April	6,	2016
What	are	obvious	problems?
•Corrupted	nameservers	
•Intercept	&	manipulate	requests	(on-path	active	
attacker)	
•Other	obvious	problems?
DNS	cache	poisoning
Internet
Victim	DNS	server
Clients
bankofamerica.com	
10.1.1.1
Attacker	site	
10.9.9.99
How	might	an	attacker	do	this?	
What	security	features	must	an	attacker	overcome?
.com	NS
•Packet	spoofing	
•Guess	UDP	port	
•Guess	QID
Assume	predictable	UDP	port
Assume	SRC	port	spoofing
think-pair-share

Another	idea:	
-	Poison	cache	for	NS	
			record	instead	
-	Now	can	take	over	all	of		
			second	level	domain
How	many	tries	does	
this	require?	
-Try	256	different	QIDs	
-Good	chance	of	success

Defenses
•Query	ID	size	is	fixed	at	16	bits	
•Repeat	each	query	with	fresh	Query	ID	
–Doubles	the	space	
•Randomize	UDP	ports	
•DNSsec	
–Cryptographically	sign	DNS	responses,	verify	via	chain	
of	trust	from	roots	on	down	
•Other	problems?
Phishing	is	common	problem
•Typo	squatting:		
•www.LansdEnd.com	
•www.goggle.com	
•secure.bank0fAmerica.com	
•wíkipedia.org	
•Phishing	attacks	
–Trick	users	into	thinking	a	malicious	domain	name	is	
the	real	one
ip routing
CIDR	addressing
backbone
ISP1
 ISP2
Prefixes	used	to	setup	hierarchical	routing:		
	 -	An	organization	assigned	a.b.c.d/x		
	 -	It	manages	addresses	prefixed	by	a.b.c.d/x	
…1111001
10110…	1110000
5.6.7.8
10110…	1111000
…1111011
10110…	1100011
Classless	inter-domain	routing	(CIDR)
Network prefix 
MSBs Host address 
x LSBs
Routing
AS 
att.net
AS	
wisc.edu
AS	
charter .net
Autonomous	systems	(AS)	are	organizational	building	blocks	
	 -	Collection	of	IP	prefixes	under	single	routing	policy	
	- 	 w i s c . e d u	
Within	AS,	might	use	RIP	(Routing	Information	Protocol)	
Between	AS,	use	BGP	(Border	Gateway	Protocol)
…1111001
10110…	1110000
5.6.7.8
10110…	1111000
…1111011
10110…	1100011
AS	Categories
•Stub:	connected	to	only	on	other	AS	
•Multi-homed:	connected	to	multiple	other	AS	
•Transit:	routes	traffic	through	it's	AS	for	other	AS's
3 4
6 57
1
8 2
BGP	and	routing
defense.gov
wisc.edu
 charter .net
BGP	(exterior	BGP)
OSPF	within	AS’s	
(Open	shortest-path	
first)
Border	Gateway	Protocol	(BGP)
•Policy-based	routing	
–AS	can	set	policy	about	how	to	route		
•economic,	security,	political	considerations	
•BGP	routers	use	TCP	connections	to	transmit	
routing	information	
•Iterative	announcement	of	routes
BGP	example
•2,	7,	3,	6	are	Transit	AS	
•8,	1	are	Stub	AS	
•4,5	multihomed	AS	
•Algorithm	seems	to	work	OK	in	practice	–BGP	does	not	respond	well	to	frequent	node	outages
3 4
6 57
1
8 2
7
7
2 7
2 7
2 7
3 2 7
6 2 7
2 6 52 6 5
2 6 5
3 2 6 5
7 2 6 5
6 5
5
5
	[D.	Wetherall]
•2008:	Pakistan	attempts	to	block	YouTube	
–youtube	is		208.65.152.0/22	
–youtube.com =  208.65.153.238 
•Pakistan	ISP	advertises	208.65.153.0/24	via	BGP	
–more	specific,	prefix	hijacking	
•Internet	thinks	youtube.com	is	in	Pakistan	
•Outage	resolved	in	2	hours…

IP	hijacking
•BGP	unauthenticated		
–Anyone	can	advertise	any	routes	
–False	routes	will	be	propagated	
•This	allows	IP	hijacking	
–AS	announces	it	originates	a	prefix	it	shouldn’t	
–AS	announces	it	has	shorter	path	to	a	prefix		
–AS	announces	more	specific	prefix	
recap
DNS 
/DNS insecurity 
/DNS cache poisoning 
/Typosquatting 
CIDR, BGP 
/IP route hijacking 
Exit slips 
/1 thing you learned 
/1 thing you didn't understand
