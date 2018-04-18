str = "#I$)@(*#&(*&#_{}[][  ][@#(*U@   #&$%...";

var a = [".", "$", "#", "[", "]"];
// a = ['a', 'b']

str.split('')
for (var i in a) {
	str = str.split('')
	.filter(element => element != a[i])
	.join('');
}

console.log(str);