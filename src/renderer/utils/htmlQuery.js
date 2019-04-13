const Id = (name) => {
    return document.getElementById(name)
}

const ClassNameSingle = (name) => {
    return document.getElementsByClassName(name)[0]
}

const QuerySelectorAll = (name) => {
    return document.querySelectorAll(name)
}

module.exports = { Id, ClassNameSingle, QuerySelectorAll }
