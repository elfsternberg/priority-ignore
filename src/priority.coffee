require.config
    paths:
        'jquery': 'libs/jquery-1.7.2'

require ['jquery', 'priority_tmpl'], ($, priority_template) ->

    class Prioritize

        constructor(@repo) ->
            @repo.get 'priorities', (p) =>
                @priorities = if p? and p.priorities? then p.priorities else []
            @render()

            $('body').on 'click', @render
            $('#thumbsup').on 'click', () => @newPriority('priority')
            $('#thumbsdn').on 'click', () => @newPriority('ignore')

        save: ->
            @repo.save {key: 'priorities', 'priorities': @priorities}, =>
                @render()

        render: =>
            priority_enumerate = (cat) ->
                (c for c in @priorities if c.cat == cat)

            priority_render = (cat) ->
                $('#priority_list').html(priority_template({priorities: priority_enumerate('priority')}))
                $('#ignore_list').html(priority_template({priorities: priority_enumerate('ignore')}))

    $ ->
        prioritize = new Lawnchair {name: 'Prioritize'}, ->
            p = this
            p.save
                key: 'priorities',
                priorities: [
                    {cat: 'priority', name: 'Omaha, Stormy, Raeney'}
                    {cat: 'ignore', name: 'Politics'}
                    {cat: 'priority', name: 'Spiral Genetics'}
                    {cat: 'priority', name: 'Looking for Work'}
                    {cat: 'priority', name: 'Writing'}
                    {cat: 'priority', name: 'Productivity Core'}
                    {cat: 'priority', name: 'Story Core'}
                    {cat: 'ignore', name: 'Smut'}
                    {cat: 'ignore', name: 'Religious Arguments'}
                    {cat: 'ignore', name: 'PASWO'}
                    {cat: 'ignore', name: 'Twitter'}
                ], ->
                handler = new Prioritize(p)
