def getTeamCode():
	team_code = open("../data/team_code.txt", "r")
	p = []
	for i in team_code:
		p.append(i)
	p[0] = p[0][p[0].index('B'):len(p[0])]
	for i in range(len(p)):
		p[i] = p[i][0:len(p[i])-1]
		if len(p[i]) > 5:
			temp = p[i].split(",")
			p[i] = ""
			for k in temp:
				p.append(k)
		else:
			p[i] = p[i]
	i = 0
	teamSet = set()
	while i < len(p):
		if p[i] == "":
			p.pop(i)
		else:
			for j in range(len(p[i])):
				if p[i][j].isdigit():
					init = j
					break
			p[i] = [p[i][:init],int(p[i][init:])]
			teamSet.add(p[i][0])
			i += 1
	return [p, teamSet]

teamCode, teamSet = getTeamCode()[0], getTeamCode()[1]
print(teamCode)
# name = "Manu"
# name = name.upper()
# if name in teamSet:
# 	for i in range(len(teamCode)):
# 		if teamCode[i][0] == name:
# 			print(teamCode[i][1])
# 			break



