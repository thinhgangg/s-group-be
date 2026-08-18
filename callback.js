const user = {
  name: "John Doe",
  getName: function () {
    return this.name;
  },
};

const userName = user.getName.bind(user);
console.log(userName());
