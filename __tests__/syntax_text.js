let dict = {};

dict['1234'] = 'Tuan';
dict['5412'] = 'what';
if ('5412' in dict) {
	console.log("RIGHT!")
}
delete dict['1234'];
delete dict['This is not even in the dict'];
console.log(dict);