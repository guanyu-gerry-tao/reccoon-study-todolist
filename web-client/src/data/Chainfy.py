import json

with open('web-client/src/data/testListcopy.json', 'r') as file:
    data = json.load(file)


projects = list(data['projectList'].keys())
# print(projects)

for i in range(len(projects)):
    data['projectList'][projects[i]].update({
        'prevProject': projects[i - 1] if i > 0 else None,
        'nextProject': projects[i + 1] if i < len(projects) - 1 else None
    })
    data['projectList'][projects[i]].pop('order')



rawtasks = list(data['taskList'].keys())
tasks = []

for i in range(len(rawtasks)):
    if i == 0 or data['taskList'][rawtasks[i]]['status'] != data['taskList'][rawtasks[i - 1]]['status'] or data['taskList'][rawtasks[i]]['project'] != data['taskList'][rawtasks[i - 1]]['project']:
        if i == len(rawtasks) - 1 or data['taskList'][rawtasks[i]]['status'] != data['taskList'][rawtasks[i + 1]]['status'] or data['taskList'][rawtasks[i]]['project'] != data['taskList'][rawtasks[i + 1]]['project']:
            data['taskList'][rawtasks[i]].update({
                'prevTask': None,
                'nextTask': None,
            })
        else:
            data['taskList'][rawtasks[i]].update({
                'prevTask': None,
                'nextTask': rawtasks[i + 1]
            })
            
    else:
        if i == len(rawtasks) - 1 or data['taskList'][rawtasks[i]]['status'] != data['taskList'][rawtasks[i + 1]]['status'] or data['taskList'][rawtasks[i]]['project'] != data['taskList'][rawtasks[i + 1]]['project']:
            data['taskList'][rawtasks[i]].update({
                'prevTask': rawtasks[i - 1],
                'nextTask': None,
            })
        else:
            data['taskList'][rawtasks[i]].update({
                'prevTask': rawtasks[i - 1],
                'nextTask': rawtasks[i + 1]
            })
    data['taskList'][rawtasks[i]].pop('order')

print(data)

with open('web-client/src/data/testListcopy2.json', 'w') as file:
    json.dump(data, file, indent=4)