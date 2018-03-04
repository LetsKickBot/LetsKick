def main():
	team_name = open("../data/team_name.txt", "r")
	p = []
	for i in team_name:
		p.append(i)
	p[0] = p[0][p[0].index('A'):len(p[0])]
	for i in range(len(p)):
		p[i] = p[i][0:len(p[i])-1]

	team_name = p
	print(p)

if __name__ == '__main__':
    main()




